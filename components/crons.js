const cron = require('cron')
const moment = require('moment')
const Discord = require('discord.js')
const db = require('../db/db')

const { getToday } = require('./today')
const { getEarthPorn } = require('./reddit')

const morningCron = client => new cron.CronJob('0 0 8 * * *', () => {
  console.log(`${moment().format()}: running cron`)

  client.channels.fetch(process.env.NOTIF_CHANNEL_ID).then(channel => {
    getToday().then(today => {
      channel.send(`Good morning, nerds. ${today}`)
    })
  })
  
  client.users.fetch(process.env.NOTIF_USER_ID).then(user =>
    getEarthPorn(['top','day']).then(res => {
      const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Morn, here\'s the top earthporn in the past day')
        .setDescription(res.text)
        .setImage(res.url)
      user.send(embed)
    })
  )
}, null, false, 'America/Toronto')

const reminderCron = client => new cron.CronJob('15 * * * * *', () => {
  const now = Date.now()
  db.all('SELECT * FROM reminders WHERE ? > time', [now], (err, rows) => {
    if (err) {
      console.error(err)
    }
    rows.forEach(reminder => {
      client.channels.fetch(reminder.channel_id).then(channel => {
        channel.send(`<@${reminder.author_id}> ${reminder.message}`)
      })
    })
  })
})

module.exports = {
  morningCron,
  reminderCron
}
