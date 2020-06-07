const chrono = require('chrono-node')
const _ = require('lodash')
const moment = require ('moment')

const db = require('../db/db')

const dbErrorHandler = err => {
  if (err) {
    console.error(err)
  }
}

const saveReminder = (time, channel, author, message) => {
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO reminders(time,author_id,channel_id,message)
      VALUES(?,?,?,?)
      `,
      [time,author,channel,message],
      function(err) {
        if (err) {
          reject(err)
        }
        resolve(this.lastID)
      }
    )
  })
}

const deleteReminder = id => {
  db.run('DELETE FROM reminders WHERE id = ?', [id], dbErrorHandler)
}

const addReminder = (args, channel, author) => {
  if (_.isEmpty(args)) {
    return channel.send("Invalid arguments.")
  }
  const message = args.pop()
  const timeStr = args.join(' ')
  const date = chrono.parseDate(timeStr)
  if (!date) {
    return channel.send("Invalid datetime.")
  }
  return saveReminder(date.getTime(), channel.id, author.id, message).then(reminder_id => {
    const CANCEL_REACT = '❌'
    return channel.send(`
    Reminder set on ${date}, ${CANCEL_REACT} react within 5 minutes to cancel.
    `).then(msg => {
    msg.react(CANCEL_REACT)
  
    const filter = (reaction, user) => (
      reaction.emoji.name == CANCEL_REACT && user.id == author.id
    )
  
    return msg.awaitReactions(filter, { max: 1, time: 300000 })
      .then(() => {
        deleteReminder(reminder_id)
        return msg.edit('Reminder cancelled.')
      })
  })

})
}

module.exports = {
  addReminder,
  deleteReminder
}
