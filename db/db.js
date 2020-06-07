const sqlite = require('sqlite3')

const db = new sqlite.Database('./db/discord-bot.db', err => {
  if (err) {
    console.error(err.message);
  }
})

db.run(`
CREATE TABLE IF NOT EXISTS reminders (
  id int PRIMARY_KEY,
  time int NOT NULL,
  author_id text NOT NULL,
  channel_id text NOT NULL,
  message text
)
`)

module.exports = db
