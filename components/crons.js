const cron = require('cron')
const _ = require('lodash')
const moment = require('moment')

const { getToday } = require('./today')
const { getCaliforniaData } = require('./corona')

const morningCron = client => new cron.CronJob('0 0 8 * * *', () => {
  console.log(`${moment().format()}: running cron`)

  client.channels.fetch(process.env.NOTIF_CHANNEL_ID).then(channel => {
    getToday().then(today => {
      channel.send(`Good morning, nerds. ${today}`)
    })
  })
  
  client.users.fetch(process.env.NOTIF_USER_ID).then(user =>
    getCaliforniaData().then(embed => {
      embed.setTitle('Morn, here are some COVID-19 stats in California')
      user.send(embed)
    })
  )
}, null, false, 'America/Toronto')

module.exports = {
  morningCron
}
