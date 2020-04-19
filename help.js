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
**.corona [country_code]:** Get the latest COVID-19 stats for a specific country (use 3-letter country codes found here https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes)


` },
    { name: '🔥 Reddit Commands', value: `
**.floridaman:** Get a article from /r/FloridaMan.
**.meme:** Get a meme from /r/DankMemes.
**.earthporn:** Get an image from /r/EarthPorn.

Reddit commands accept optional parameters [sort_type] [time_range] [offset].
- **sort_type** is currently limited to 'top', other types coming soon!.
- **time_range** is one of (all, year, month, week, day, hour), default is 'day'.
- **offset** is a number between 0 and 100, default is 0.

Example Usage:
\`.floridaman top\`
\`.meme top month \`
\`.earthporn top week 2 \`
` },
	)

module.exports = {
  helpEmbed
}
