const axios = require('axios').default
const cheerio = require('cheerio')
const moment = require('moment')

const getDaysOfTheYear = () =>
  axios.get('https://daysoftheyear.com').then(res => {
    const $ = cheerio.load(res.data)
    const elem = $(".card__title > a", ".today")
    return {
      text: elem.text(),
      url: elem.attr('href')
    }
  })

const getToday = () => {
  const today = moment().format('MMMM Do')
  return getDaysOfTheYear().then(daysOfTheYear => {
    if (daysOfTheYear) {
      const { text, url } = daysOfTheYear
      return `Today (${today}) is ${text}! ${url}`
    } else {
      return `Today is ${today}!`
    }
  })
}

module.exports = {
  getToday
}
