const chrono = require('chrono-node')
const _ = require('lodash')
const moment = require ('moment')

const db = require('../db/db')

const saveReminder = (time, channel, author, message) => {
  db.run(`
INSERT INTO reminders(time,author_id,channel_id,message)
VALUES(?,?,?,?)
`, [time,author,channel,message], err => {
  if (err) {
    console.error(err)
  }
})
}

const addReminder = (args, channel, author) => {
  if (_.isEmpty(args)) {
    return "Invalid arguments."
  }
  const message = args.pop()
  const timeStr = args.join(' ')
  const refDate = moment().tz('America/New_York').toDate()
  const date = chrono.parseDate(timeStr, refDate)
  if (!date) {
    return "Invalid datetime."
  }
  saveReminder(date.getTime(), channel, author, message)
  return `Reminder set on ${date}`
}

module.exports = {
  addReminder
}
