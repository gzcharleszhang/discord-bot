require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
const cron = require('cron')
const _ = require('lodash')

const { getToday } = require('./today')

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
const CHANNEL_ID = process.env.NOTIF_CHANNEL_ID
const KALLEN_ID = process.env.NOTIF_USER_ID
const DEV_ID = process.env.DEV_ID

const helpEmbed = new Discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle('WMLOH help')
	.addFields(
    { name: 'List of commands', value: `
**.help:** Show this help page
**.wmloh:** Who's wmloh?
**.todev [message]:** Send a message to the dev
**.coinflip [n]:** Flip a coin (n times)
**.today:** Get date and day of the year
    ` },
	)

const morningCron = new cron.CronJob('0 0 8 * * *', () => {
  console.log('running cron')
  client.channels.fetch(CHANNEL_ID).then(channel => {
    const today = getToday
    channel.send(`Good morning, nerds. ${today}`)
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
    if (!message.content.startsWith(trigger) || message.author.bot) return

    const args = message.content.slice(trigger.length).split(' ');
    const command = args.shift().toLowerCase();
    const argStr = message.content.substring(command.length + 2)

    switch(command) {
      case 'wmloh':
        message.channel.send('https://www.linkedin.com/in/wei-min-loh/')
        return
      case 'todev':
        client.users.fetch(DEV_ID).then(dev => {
          dev.send(`<@${message.author.id}>: ${argStr}`)
        })
        return
      case 'help':
        message.channel.send(helpEmbed)
        return
      case 'coinflip':
        if (_.isEmpty(args)) {
          const side = Math.random() > 0.5 ? 'Heads.' : 'Tails.'
          message.channel.send(side)
        } else {
          const numFlips = parseInt(args[0])
          if (isNaN(numFlips)) {
            message.channel.send('Invalid number of times.')
          } else {
            let hc = 0
            let tc = 0
            for (let i = 0; i < numFlips; i++) {
              if (Math.random() > 0.5) {
                hc++
              } else {
                tc++
              }
            }
            message.channel.send(`${hc} heads, ${tc} tails.`)
          }
        }
        return
      case 'today':
        getToday().then(today => {
          message.channel.send(today)
        })
        return
    }
  })

  client.login(BOT_TOKEN)

  morningCron.start()
}

startBot();
