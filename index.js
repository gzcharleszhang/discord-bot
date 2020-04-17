require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
const cron = require('cron');

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
const CHANNEL_ID = process.env.NOTIF_CHANNEL_ID
const KALLEN_ID = process.env.NOTIF_USER_ID
const DEV_ID = process.env.DEV_ID

const helpEmbed = new Discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle('WMLOH help')
	.addFields(
    { name: 'List of commands', value: `
      **.help:** Shows this help page
      **.wmloh:** Who's wmloh?
      **.todev:** Sends a message to the dev (usage: \`.todev [message]\`)
    ` },
	)

const morningCron = new cron.CronJob('0 0 8 * * *', () => {
  console.log('running cron')
  client.channels.fetch(CHANNEL_ID).then(channel => {
    channel.send('Good morning, nerds!')
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

    const argStr = message.content.slice(trigger.length)
    const args = argStr.split(' ');
    const command = args.shift().toLowerCase();

    switch(command) {
      case 'wmloh':
        message.channel.send('https://www.linkedin.com/in/wei-min-loh/')
      case 'todev':
        client.users.fetch(DEV_ID).then(dev => {
          dev.send(argStr)
        })
      case 'help':
        message.channel.send(helpEmbed)
    }
  })

  client.login(BOT_TOKEN)

  morningCron.start()
}

startBot();

// const getAccessCode = () => {
//   const URL = `/oauth2/authorize?response_type=code&client_id=${USERNAME}&scope=identify`
//   axios.get(BASE_URL + URL).then(res => {
//     return res
//   }).catch(e => console.log(e))
// }

// const getToken = () => {
//   const code = getAccessCode()
//   console.log(code)
//   const data = {
//     'client_id': USERNAME,
//     'client_secret': PASSWORD,
//     'grant_type': 'authorization_code',
//     'code': code,
//     'scope': 'identify email connections'
//   }
// }


