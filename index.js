require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
const _ = require('lodash')

const { getToday } = require('./components/today')
const { getWeather } = require('./components/weather')
const { getCoronaData } = require('./components/corona')
const { getMeme, getFloridaMan, getEarthPorn } = require('./components/reddit')
const { helpEmbed } = require('./components/help')
const { morningCron } = require('./components/crons')
const { coinflip } = require('./components/coinflip')

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
const CHANNEL_ID = process.env.NOTIF_CHANNEL_ID
const DEV_ID = process.env.DEV_ID

const startBot = () => {
  const trigger = '.'
  client.once('ready', () => {
    if (process.env.NODE_ENV == 'dev') {
      console.log('Bot is ready!')
    } else {
      client.channels.fetch(CHANNEL_ID).then(channel => {
        channel.send('wmloh has awoken with new powers!')
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
        promise = message.channel.send(coinflip(args))
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

  morningCron(client).start()
}

startBot();
