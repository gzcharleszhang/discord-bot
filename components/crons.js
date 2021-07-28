const cron = require('cron')
const moment = require('moment')
const Discord = require('discord.js')
const db = require('./db')

const { getEarthPorn } = require('./reddit')
const { deleteReminder } = require('./reminder')

const morningCron = client => new cron.CronJob('0 0 8 * * *', () => {
  console.log(`${moment().format()}: running cron`)

  const earth = await getEarthPorn(['top','day'])
  const earthEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Nature pic of the day')
    .setDescription(earth.text)
    .setImage(earth.url)

  const channel = await client.channels.fetch(process.env.NOTIF_CHANNEL_ID)
  channel.send(earthEmbed)
}, null, false, 'America/Toronto')

const reminderCron = client => new cron.CronJob('*/15 * * * * *', () => {
  const now = Date.now()
  db.all('SELECT * FROM reminders WHERE ? > time', [now], (err, rows) => {
    if (err) {
      console.error(err)
    }
    rows.forEach(reminder => {
      client.channels.fetch(reminder.channel_id).then(channel => {
        channel.send(`<@${reminder.author_id}> ${reminder.message}`).then(() => {
          deleteReminder(reminder.id)
        })
      })
    })
  })
})

module.exports = {
  morningCron,
  reminderCron
}
