const Discord = require('discord.js')

const helpEmbed = new Discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle('WMLOH')
	.addFields(
    { name: '🛠 General Commands', value: `
**.help:** Show this help page
**.wmloh:** Who's wmloh?
**.todev [message]:** Send a message to the dev
**.riothelp [message]:** Request support from a Riot specialist
**.cshelp [message]:** Request support from a CS god
**.coinflip:** Flip a coin
**.coinflip [n]:** Flip a coin n times
**.today:** Get date and day of the year
**.weather [city] [state] [country_code]:** Get 3-hour forecast


` },
    { name: '🦠 COVID-19', value: `
**.corona:** Get the latest global stats for COVID-19
**.corona [country_code]:** Get the latest COVID-19 stats for a specific country (use 3-letter country codes found [here](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes))


` },
    { name: '📅 Reminders', value: `
**.remind [time] "[message]":** Set a reminder

Example Usage:
\`.remind 5 minute "Call Henry Gao."\`
\`.remind tuesday "Ask Henry Gao about Java."\`


` },
    { name: '🔥 Reddit Commands', value: `
**.floridaman:** Get an article from /r/FloridaMan.
**.meme:** Get a meme from /r/DankMemes.
**.earth:** Get an image from /r/EarthPorn.
**.space:** Get an image from /r/SpacePorn.
**.creepy:** Get a creepy post from /r/Creepy.
**.gonecivil:** Get a civil post from /r/GoneCivil.

Reddit commands accept optional parameters [sort_type] [offset] [time_range].
- **sort_type** is one of (hot, new, top).
- **offset** is a number between 0 and 100, default is 0.
- **time_range** is only available if sort_type='top'. One of (all, year, month, week, day, hour), default is 'day'.

Example Usage:
\`.floridaman hot\`
\`.spaceporn new 1\`
\`.meme top month \`
\`.earthporn top 2 week\`
` },
	)

module.exports = {
  helpEmbed
}
