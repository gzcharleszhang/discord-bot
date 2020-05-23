const axios = require('axios').default
const _ = require('lodash')
const moment = require('moment')
const Discord = require('discord.js')
const csv = require('@fast-csv/parse')

const noData = 'No data available.'

const getGlobalData = () => {
  const url = 'https://api.thevirustracker.com/free-api?global=stats'
  return axios.get(url).then(res => {
    const { data } = res
    if (!data || _.isEmpty(data.results)) return noData
    const result = data.results[0]
    const embed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Global COVID-19 Stats')
    .addFields(
      { name: 'New cases today', value: `${result['total_new_cases_today']}`, inline: true},
      { name: 'New deaths today', value: `${result['total_new_deaths_today']}`, inline: true},
      { name: 'Total cases', value: `${result['total_cases']}`, inline: true},
      { name: 'Total active cases', value: `${result['total_active_cases']}`, inline: true},
      { name: 'Total recovered cases', value: `${result['total_recovered']}`, inline: true},
      { name: 'Total deaths cases', value: `${result['total_deaths']}`, inline: true},
    )
    return embed
  })
}

const getCountryData = (country) => {
  const url = `https://covidapi.info/api/v1/country/${country}`
  return axios.get(url).then(res => {
    const { data } = res
    if (!data || !data.result) return noData
    let today = moment().format('YYYY-MM-DD')
    let yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD')
    let offset = 0
    while (!_.get(data.result, today)) {
      if (offset > 14) {
        return 'No recent data available.'
      }
      offset++
      today = moment().subtract(offset, 'day').format('YYYY-MM-DD')
      yesterday = moment().subtract(offset+1, 'day').format('YYYY-MM-DD')
    }
    const { confirmed: ct, deaths: dt, recovered: rt } = _.get(data.result, today)
    const { confirmed: cy, deaths: dy, recovered: ry } = _.get(data.result, yesterday)
    const diff = {
      cd: ct - cy,
      dd: dt - dy,
      rd: rt - ry
    }
    const embed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`Latest COVID-19 Stats in ${country}`)
      .setDescription(`Last updated ${today}`)
      .addFields(
        { name: 'New cases today', value: `${diff.cd}`, inline: true},
        { name: 'New deaths today', value: `${diff.dd}`, inline: true},
        { name: 'New recovered today', value: `${diff.rd}`, inline: true},
        { name: 'Total cases', value: `${ct}`, inline: true},
        { name: 'Toal recovered', value: `${rt}`, inline: true},
        { name: 'Total deaths', value: `${dt}`, inline: true},
      )
    return embed
  }).catch(() => 'No data available, make sure the 3-letter country code is in this list https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes.')
}

const getCaliforniaData = () => {
  const CSV_URL = 'https://raw.githubusercontent.com/datadesk/california-coronavirus-data/master/latimes-state-totals.csv'
  return axios.get(CSV_URL).then(res =>
    new Promise((resolve, reject) =>
      csv.parseString(res.data, {
        headers: true,
        maxRows: 1
      }).on('data', data => {
        const {
          date,
          confirmed_cases,
          deaths,
          new_confirmed_cases,
          new_deaths
        } = data
        const embed = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setTitle(`Latest COVID-19 Stats in California`)
          .setDescription(`Last updated ${date}`)
          .addFields(
            { name: 'New cases', value: `${new_confirmed_cases}`, inline: true},
            { name: 'New deaths', value: `${new_deaths}`, inline: true},
            { name: 'Total cases', value: `${confirmed_cases}`, inline: true},
            { name: 'Total deaths', value: `${deaths}`, inline: true},
          )
        resolve(embed)
      }).on('end', () => reject('No data available.')))
  )
}

const getCoronaData = args => {
  if (_.isEmpty(args)) {
    return getGlobalData()
  } else if (args[0].length != 3) {
    return Promise.resolve('Please specify a 3-letter country code.')
  } else {
    return getCountryData(args[0].toUpperCase())
  }
}

module.exports = {
  getCoronaData,
  getCaliforniaData
}
