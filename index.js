require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
const cron = require('cron')
const _ = require('lodash')
const moment = require('moment')

const { getToday } = require('./today')
const { getWeather } = require('./weather')
const { getCoronaData } = require('./corona')
const { getMeme, getFloridaMan, getEarthPorn } = require('./reddit')
const { helpEmbed } = require('./help')

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
const CHANNEL_ID = process.env.NOTIF_CHANNEL_ID
const KALLEN_ID = process.env.NOTIF_USER_ID
const DEV_ID = process.env.DEV_ID


const morningCron = new cron.CronJob('0 0 8 * * *', () => {
  console.log(`${moment().format()}: running cron`)

  client.channels.fetch(CHANNEL_ID).then(channel => {
    getToday().then(today => {
      channel.send(`Good morning, nerds. ${today}`)
    })
  })
  
  client.users.fetch(KALLEN_ID).then(user => {
    user.send('morn (reply with ".todev [message]")')
  })
}, null, false, 'America/Toronto')

const startBot = () => {
  const trigger = '.'
  client.once('ready', () => {
    if (process.env.NODE_ENV == 'dev') {
      console.log('Bot is ready!')
    } else {
      client.channels.fetch(CHANNEL_ID).then(channel => {
        channel.send('wmloh is woke')
      })
    }
  })

  client.on('message', message => {
    let promise = Promise.resolve(null)

    if (message.mentions.has(client.user)) {
      message.channel.send('Hi.')
    }

    if (!message.content.startsWith(trigger) || message.author.bot) return Promise.resolve(null)

    const args = message.content.slice(trigger.length).split(' ');
    const command = args.shift().toLowerCase();
    const argStr = message.content.substring(command.length + 2)

    switch(command) {
      case 'wmloh':
        promise = message.channel.send('https://www.linkedin.com/in/wei-min-loh/')
        break
      case 'todev':
        promise = client.users.fetch(DEV_ID).then(dev =>
          dev.send(`<@${message.author.id}>: ${argStr}`)
        )
        break
      case 'cshelp':
        promise = client.users.fetch(process.env.CS_HELP_ID).then(dev =>
          dev.send(`<@${message.author.id}> (CS help): ${argStr}`)
        )
        break
      case 'riothelp':
        promise = client.users.fetch(process.env.RIOT_HELP_ID).then(dev =>
          dev.send(`<@${message.author.id}> (Riot help): ${argStr}`)
        )
        break
      case 'help':
        promise = message.channel.send(helpEmbed)
        break
      case 'coinflip':
        const FLIP_LIMIT = 42069420
        if (_.isEmpty(args)) {
          const side = Math.random() > 0.5 ? 'Heads.' : 'Tails.'
          promise = message.channel.send(side)
        } else {
          const numFlips = parseInt(args[0])
          if (isNaN(numFlips)) {
            promise = message.channel.send('Invalid number of times.')
          } else {
            if (numFlips > FLIP_LIMIT) {
              promise = message.channel.send(`Maximum number of flips is ${FLIP_LIMIT}.`) 
              return
            }
            let hc = 0
            let tc = 0
            for (let i = 0; i < numFlips; i++) {
              if (Math.random() <= 0.5) {
                hc++
              } else {
                tc++
              }
            }
            promise = message.channel.send(`${hc} heads, ${tc} tails.`)
          }
        }
        break
      case 'today':
        promise = getToday().then(today =>
          message.channel.send(today)
        )
        break
      case 'weather':
        const defaultLocation = ['Toronto']
        promise = getWeather(_.isEmpty(args) ? defaultLocation : args).then(res =>
          message.channel.send(res)
        )
        break
      case 'corona':
        promise = getCoronaData(args).then(res =>
          message.channel.send(res)
        )
        break
      case 'floridaman':
        promise = getFloridaMan(args).then(res =>
          message.channel.send(res.text, _.get(res, 'options', null))
        )
        break
      case 'meme':
        promise = getMeme(args).then(res =>
          message.channel.send(res.text, _.get(res, 'options', null))
        )
        break
      case 'earthporn':
        promise = getEarthPorn(args).then(res => {
          return message.channel.send(res.text, _.get(res, 'options', null))
        }
        )
        break
      case 'testerr':
        promise = message.channel.send(null)
        break
    }
    return promise.catch(e => {
      console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
      console.log(`${message.author.username}: ${message.content}`)
      console.log(e)
      return message.channel.send('Something went wrong, please try again later or contact dev using \`.todev\`')
    })
  })

  client.login(BOT_TOKEN)

  morningCron.start()
}

startBot();
