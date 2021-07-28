const cron = require('cron')
const moment = require('moment')
const db = require('./db')

const { getEarthPorn, getMeme, getMeIRL, getSpacePorn, getFloridaMan, getSkyPorn, getCreepy } = require('./reddit')
const { deleteReminder } = require('./reminder')

const dayToRedditFn = [
  [getMeme, 'Meme'],              // Monday
  [getEarthPorn, 'Nature'],       // Tuesday
  [getMeIRL, 'Me IRL'],           // Wednesday
  [getSpacePorn, 'Space'],        // Thursday
  [getFloridaMan, 'Florida Man'], // Friday
  [getSkyPorn, 'Sky'],            // Saturday
  [getCreepy, 'Creepy Pic'],      // Sunday
]

const redditOfTheDay = async (client) => {
  console.log(`${moment().format()}: reddit of the day`)

  const [redditFn, title] = dayToRedditFn[new Date().getDay()]
  const post = await redditFn(['top','week'])

  const channel = await client.channels.fetch(process.env.NOTIF_CHANNEL_ID)
  channel.send(`**${title} of The Week**\n${post.text}: ${post.url}`)
}

const morningCron = client => new cron.CronJob(
  '0 0 8 * * *', () => redditOfTheDay(client), null, false, 'America/Toronto')

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
  reminderCron,
  redditOfTheDay
}
