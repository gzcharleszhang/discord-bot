const sqlite = require('sqlite3')

const db = new sqlite.Database('./db/discord-bot.db', err => {
  if (err) {
    console.error(err.message);
  }
})

db.run(`
CREATE TABLE IF NOT EXISTS reminders (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  time INTEGER NOT NULL,
  author_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  message TEXT
)
`)

module.exports = db
