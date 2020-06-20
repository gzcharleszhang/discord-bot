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

const getReminderForUser = (user, channel) =>
  new Promise((resolve, reject) => {
  db.all(`
    SELECT * FROM reminders
    WHERE author_id = ? AND channel_id = ? AND time > ?
    ORDER BY time ASC
  `, [user.id, channel.id, Date.now()], (err, rows) => {
    if (err) {
      reject(err)
    }
    if (_.isEmpty(rows)) {
      resolve('You have no upcoming reminders.')
    }
    let msg = 'Your upcoming reminders:\n'
    rows.forEach(r => {
      const date = moment(r.time).format('llll')
      msg += `${r.id} ${date}: ${r.message}\n`
    })
    resolve(msg)
  })
})

const addReminder = (args, channel, author) => {
  if (_.isEmpty(args)) {
    return channel.send("Invalid arguments.")
  }
  const message = args.pop()
  const timeStr = args.join(' ')
  const date = chrono.parseDate(timeStr, new Date(), { forwardDate: true })
  if (!date) {
    return channel.send("Invalid datetime.")
  }
  return saveReminder(date.getTime(), channel.id, author.id, message).then(reminder_id => {
    const CANCEL_REACT = '❌'
    return channel.send(`
      Reminder set on ${date}, ${CANCEL_REACT} react within 5 minutes to cancel.
      `).then(msg => {

        const filter = (reaction, user) => (
          reaction.emoji.name == CANCEL_REACT && user.id == author.id
        )

        const collector = msg.createReactionCollector(filter, { max: 1, time: 300000 });

        collector.on('collect', () => {
          deleteReminder(reminder_id)
          return msg.edit('Reminder cancelled.')
        });

        return msg.react(CANCEL_REACT)
    })

})
}

module.exports = {
  addReminder,
  deleteReminder,
  getReminderForUser
}
