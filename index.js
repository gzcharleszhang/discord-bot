require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
const _ = require('lodash')
const winston = require('winston')
const moment = require('moment')

const { getToday } = require('./components/today')
const { getWeather } = require('./components/weather')
const { getCoronaData } = require('./components/corona')
const reddit = require('./components/reddit')
const { helpEmbed } = require('./components/help')
const { morningCron } = require('./components/crons')
const { coinflip } = require('./components/coinflip')

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
const CHANNEL_ID = process.env.NOTIF_CHANNEL_ID
const DEV_ID = process.env.DEV_ID

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) =>
      `[${timestamp}] ${level}: ${JSON.stringify(message)}`)
  ),
  transports: [
    new winston.transports.File({
      filename: `logs/${moment().format('YYYY-MM-DD')}.log`
    }),
    new winston.transports.File({
      filename: `logs/${moment().format('YYYY-MM-DD')}-error.log`,
      level: 'error'
    })
  ]
})

if (process.env.NODE_ENV === 'dev') {
  logger.add(new winston.transports.Console({
    format: winston.format.prettyPrint()
  }))
}

const startBot = () => {
  const trigger = '.'
  client.once('ready', () => {
    if (process.env.NODE_ENV == 'dev') {
      console.log('Bot is ready!')
    } else {
      client.users.fetch(DEV_ID).then(dev => {
        dev.send('Bot is up!')
      })
    }
    client.user.setActivity('.help', { type: 'WATCHING' })
  })

  client.on('message', message => {
    let promise = Promise.resolve(null)

    if (message.mentions.has(client.user)) {
      message.channel.send('Hi.')
    }

    if (!message.content.startsWith(trigger) || message.author.bot) return Promise.resolve(null)

    // const args = message.content.slice(trigger.length).split(' ');
    let args = message.content.slice(trigger.length).match(/[^\s"']+|"([^"]*)"|'([^']*)'/g)
    args = _.map(args, arg => {
      if (arg[0].match(/'|"/g) && arg[arg.length-1].match(/'|"/g)) {
        return arg.slice(1,arg.length-1)
      }
      return arg
    })
    const command = args.shift().toLowerCase();
    const argStr = message.content.slice(command.length + 2)

    const requestObj = {
      author: message.author.id,
      authorName: message.author.username,
      channel: message.channel.id,
      command,
      args,
      content: message.content
    }

    logger.info(requestObj)

    switch(command) {
      case 'wmloh':
        promise = message.channel.send('https://www.linkedin.com/in/wei-min-loh/')
        break
      case 'todev':
        promise = client.users.fetch(DEV_ID).then(dev =>
          dev.send(`<@${message.author.id}>: ${argStr}`)
        ).then(() => message.channel.send('Message sent!'))
        break
      case 'cshelp':
        promise = client.users.fetch(process.env.CS_HELP_ID).then(dev =>
          dev.send(`<@${message.author.id}> (CS help): ${argStr}`)
        ).then(() => message.channel.send('Message sent!'))
        break
      case 'riothelp':
        promise = client.users.fetch(process.env.RIOT_HELP_ID).then(dev =>
          dev.send(`<@${message.author.id}> (Riot help): ${argStr}`)
        ).then(() => message.channel.send('Message sent!'))
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
        promise = reddit.getFloridaMan(args).then(res =>
          message.channel.send(res.text, _.get(res, 'options', null))
        )
        break
      case 'meme':
        promise = reddit.getMeme(args).then(res =>
          message.channel.send(res.text, _.get(res, 'options', null))
        )
        break
      case 'earthporn':
        promise = reddit.getEarthPorn(args).then(res =>
          message.channel.send(res.text, _.get(res, 'options', null))
        )
        break
      case 'spaceporn':
        promise = reddit.getSpacePorn(args).then(res =>
          message.channel.send(res.text, _.get(res, 'options', null))
        )
        break
      case 'creepy':
        promise = reddit.getCreepy(args).then(res =>
          message.channel.send(res.text, _.get(res, 'options', null))
        )
        break
      case 'gonecivil':
        promise = reddit.getGoneCivil(args).then(res =>
          message.channel.send(res.text, _.get(res, 'options', null))
        )
        break
      case 'testerr':
        promise = message.channel.send(null)
        break
    }
    return promise.catch(e => {
      const errorObj = {
        author: message.author.id,
        authorName: message.author.username,
        channel: message.channel.id,
        content: message.content
      }
      logger.error(errorObj)
      return message.channel.send('Something went wrong, please try again later or contact dev using \`.todev\`')
    })
  })

  client.login(BOT_TOKEN)

  morningCron(client).start()
}

startBot();
