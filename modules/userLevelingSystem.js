const mongoose = require('mongoose')
const ms = require('ms')
const { EmbedBuilder, bold, inlineCode } = require('discord.js')

class LevelingClient {
  schemas = {
    timer: mongoose.model(
      'leveling-system-timers',
      new mongoose.Schema({
        User: String,
        Username: String,
        Start: Number,
        Guild: String
      })
    ),

    user: mongoose.model(
      'leveling-system-users',
      new mongoose.Schema({
        User: String,
        Username: String,
        StartDate: Number,
        Time: Number,
        Guild: String
      })
    )
  }

  /**
   * @param {import('discord.js').Client} - Discord Client
   * @param {String} mongoPath - Url database MongoDB
   * @param {Boolean} debugMode - Debug mode
   */
  constructor(client, mongoPath, debugMode = false) {

    this.client = client
    this.debugMode = debugMode

    if(mongoose.connection.readyState === 1) return
    if(!mongoPath) throw new Error("Connessione a database non presente!")
    
    mongoose.set('strictQuery', true)

    mongoose.connect(mongoPath, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })

    if(debugMode) {
      console.log('Connesso a MongoDB!')
    }
  }

  /**
   * @description Put this inside your voiceStateChange client event!
   * @param {import('discord.js').VoiceState} oldState 
   * @param {import('discord.js').VoiceState} newState 
   */
  async startListener (oldState, newState) {

    const userId = newState.member.id
    const guildId = newState.guild.id
    const guild = this.client.guilds.cache.get(guildId)
    const channelPresencesArray = Array.from(guild.voiceStates.cache.filter(state => { return state.channelId == (newState.channelId ? newState.channelId : oldState.channelId) && state.member.user.bot == false && state.member.user.id != userId && state.selfDeaf == false }).keys())

    if(newState.channel && newState.channel.id != newState.guild.afkChannelId && newState.selfDeaf == false && channelPresencesArray.length > 0) {

      if(!await this.schemas.timer.findOne({ User: userId, Guild: guildId })) {

        if(this.debugMode) {
          console.log(`${newState.member.user.tag} sta farmando XP [${this.client.guilds.cache.get(guildId).name}] [${new Date().toLocaleDateString('it-IT', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        })}]`)
        }

        new this.schemas.timer({
          User: userId,
          Username: newState.member.user.username,
          Start: Date.now(),
          Guild: guildId
        }).save()
      }

      channelPresencesArray.forEach(async inChatUserId => {
        const userPresence = guild.voiceStates.cache.get(inChatUserId)

        if(userPresence.selfDeaf) return

        const user = guild.members.cache.get(inChatUserId)
        const username = user.user.username

        if(!await this.schemas.timer.findOne({ User: inChatUserId, Guild: guildId })) {

          if(this.debugMode) {
            console.log(`${user.user.tag} sta farmando XP [${this.client.guilds.cache.get(guildId).name}] [${new Date().toLocaleDateString('it-IT', {
              day: 'numeric',
              month: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
          })}]`)
          }

          new this.schemas.timer({
            User: inChatUserId,
            Username: username,
            Start: Date.now(),
            Guild: guildId
          }).save()
        }
      })

      return
    }

    if(await this.schemas.timer.findOne({ User: userId, Guild: guildId })) {
      if (this.debugMode) {
        console.log(
          `${newState.member.user.tag} ha smesso di farmare XP [${this.client.guilds.cache.get(guildId).name}] [${new Date().toLocaleDateString('it-IT', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        })}]`
        );
      }

      // If the user is the last one in the channel, delete the timer
      if(channelPresencesArray.length == 1) {
        this.startListener(oldState, guild.voiceStates.cache.get(channelPresencesArray[0]))
      }

      this.schemas.timer.findOne(
        { User: userId, Guild: guildId },
        async (err, timerData) => {
          if(!timerData) return

          this.schemas.user.findOne(
            { User: userId, Guild: guildId },
            async (err, userData) => {
              const Time = Date.now() - timerData.Start;
              timerData.delete()
              if(this.debugMode) {
                console.log(
                  ms(Time, { long: true }) + ` for ${newState.member.user.tag} [${this.client.guilds.cache.get(guildId).name}]`
                )
              }

              if(!userData) {
                if(this.debugMode) {
                  console.log(`Inserted ${newState.member.user.tag} on MongoDB [${this.client.guilds.cache.get(guildId).name}]`)
                }
                new this.schemas.user({
                  User: userId,
                  Username: newState.member.user.username,
                  StartDate: Date.now(),
                  Time,
                  Guild: guildId
                }).save()
              } else {
                userData.Time += Time
                userData.save()
              }
            }
          )
        }
      )
    }
    
  }

  /**
  * @description Fetching and sorting raw data from guild
  * @param {String} guildId discord.js's guild aka `message.guild`
  * @returns {Promise<Array>} Array of objects
  */
  async sortUsers(guildId) {
    return new Promise(async (resolve, reject) => {
      try {
        const userLeaderboard = await this.schemas.user
        .find({ Guild: guildId })
        .sort({ Time: -1 });

        resolve(userLeaderboard)
      } catch (e) {
        reject(e)
      }
    })
  }

  async getUserData(guildId, userId) {
    return new Promise(async (resolve, reject) => {
      const data = await this.schemas.user.findOne({
        Guild: guildId,
        User: userId
      })
      if(!data) return resolve(null)

      const position = (await this.sortUsers(guildId)).findIndex(user => user.User == userId) + 1

      const { User, Time, Username, Guild, StartDate } = data
      resolve({ User, Time, Username, Guild, position, StartDate })
    })
  }

  /**
  * @description Generate a leaderboard
  * @param {String} guildId discord.js's guild aka `message.guild`
  * @param {Number} top How many users you want to show
  * @returns {Promise<EmbedBuilder>} Leaderboard Embed
  */
  async generateLeaderboard(guildId, userId, top = 10) {
    return new Promise(async (resolve, reject) => {
      try {

        const data = await this.sortUsers(guildId)

        if(data.length == 0) return reject("No users")

        var isPresent = false
        
        const topTen = data.slice(0, top).map((x, index) => {
          var string = ''

          if(index == 0) {
            string = `🥇${bold(`#`)} <@${x.User}> - ${inlineCode(msToTime(x.Time))}`
          } else if(index == 1) {
            string = `🥈${bold(`#`)} <@${x.User}> - ${inlineCode(msToTime(x.Time))}`
          } else if(index == 2) {
            string = `🥉${bold(`#`)} <@${x.User}> - ${inlineCode(msToTime(x.Time))}`
          } else {
            string = `${bold(`${index + 1}#`)} <@${x.User}> - ${inlineCode(msToTime(x.Time))}`
          }
          
          if(x.User == userId) {
            isPresent = true
            string += ` ${bold("👑")}`
          }

          return string
        })

        if(!isPresent) {
          const userData = await this.getUserData(guildId, userId)
          if(userData) {
            topTen.push(`[...]`)
            topTen.push(`${bold(`${userData.position}#`)} <@${userData.User}> - ${inlineCode(msToTime(userData.Time))} ${bold("👑")}`)
          }
        }

        if(this.debugMode) {
          console.log('Creating leaderboard...')
        }

        const embedDescription = topTen.join("\n")

        const leaderboardEmbed = new EmbedBuilder()
          .setDescription(
            embedDescription
          )
        
        resolve(leaderboardEmbed)

      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * @param {String} guildId - Id server
   * @param {String} userId - Id utente
   * @returns {Promise<Object>}
   */
  async calculateUserLvl(guildId, userId) {

    var currEx = process.env.MIN_1LVL * 60 * 1000 //Esperienza della persona di partenza
    var lvl = 0;

    return new Promise(async (resolve, reject) => {

      const userData = await this.schemas.user.findOne({
        User: userId,
        Guild: guildId
      })

      if(!userData) return resolve(null)

      var userTime = userData.Time

      function calcola(lvl,currEx,userTime) {
        if(userTime - currEx > 0) {
          userTime = userTime - currEx
          lvl++;
        
          currEx = currEx + (15/100)*currEx; //Ogni livello è +15% del prec
        
          calcola(lvl, currEx, userTime)
        } else {
          const result = {
            "livello": lvl,
            "tempoCorrente": userTime,
            "requiredXp": currEx 
          }
          resolve(result)
        }
      }
        
      calcola(lvl, currEx, userTime)
    })
  }
  
}

/**
 * 
 * @param {Number} ms 
 * @returns {String}
 */
function msToTime(ms) {
  const days = Math.floor(ms / (24*60*60*1000));
  const daysms = ms % (24*60*60*1000);
  const hours = Math.floor(daysms / (60*60*1000));
  const hoursms = ms % (60*60*1000);
  const minutes = Math.floor(hoursms / (60*1000));
  const minutesms = ms % (60*1000);
  const sec = Math.floor(minutesms / 1000);
  return days + "g" + hours + "h" + minutes + "m" + sec + "s";
}

module.exports = LevelingClient
