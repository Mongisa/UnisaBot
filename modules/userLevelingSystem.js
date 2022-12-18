const mongoose = require('mongoose')
const ms = require('ms')

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
    const channelPresencesArray = Array.from(guild.voiceStates.cache.filter(state => { return state.channelId == newState.channelId && state.member.user.bot == false && state.member.user.id != userId }).keys())

    if(newState.channel && newState.channel.id != newState.guild.afkChannelId && newState.selfDeaf == false && channelPresencesArray.length > 0) {

      if(!await this.schemas.timer.findOne({ User: userId, Guild: guildId })) {

        if(this.debugMode) {
          console.log(`${newState.member.user.tag} sta farmando XP`)
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
            console.log(`${user.user.tag} sta farmando XP`)
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

    if (this.debugMode) {
      console.log(
        `${newState.member.user.tag} ha smesso di farmare XP`
      );
    }

    if(await this.schemas.timer.findOne({ User: userId, Guild: guildId })) {
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
                  ms(Time, { long: true }) + ` for ${newState.member.user.tag}`
                )
              }

              if(!userData) {
                new this.schemas.user({
                  User: userId,
                  Username: newState.member.user.username,
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
  
}

module.exports = LevelingClient