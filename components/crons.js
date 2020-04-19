const cron = require('cron')
const _ = require('lodash')
const moment = require('moment')

const { getToday } = require('./today')

const morningCron = client => new cron.CronJob('0 0 8 * * *', () => {
  console.log(`${moment().format()}: running cron`)

  client.channels.fetch(process.env.NOTIF_CHANNEL_ID).then(channel => {
    getToday().then(today => {
      channel.send(`Good morning, nerds. ${today}`)
    })
  })
  
  client.users.fetch(process.env.NOTIF_USER_ID).then(user => {
    user.send('morn")')
  })
}, null, false, 'America/Toronto')

module.exports = {
  morningCron
}
