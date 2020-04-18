const axios = require('axios').default
const _ = require('lodash')
require('dotenv').config()

const getWeatherData = queryStr => {
  const endpoint = 'https://api.openweathermap.org/data/2.5/forecast'
  const apiKey = process.env.WEATHER_API_KEY
  return axios.get(`${endpoint}?q=${queryStr}&appid=${apiKey}`)
}

const toCelcius = k => parseInt(k - 273.15)

const getWeather = args => {
  const queryStr = args.join(',')
  return getWeatherData(queryStr).then(res => {
    if (!res.data) return 'No weather data available.'
    let str = '3-hour forecast'
    if (res.data.city) {
      const { name, country } = res.data.city
      str += ` in ${name}, ${country}`
    }
    if (!_.isEmpty(res.data.list)) {
      const data = res.data.list[0]
      str += ":"
      if (!_.isEmpty(data.weather)) {
        const { description } = data.weather[0]
        str += ` ${description}.`
      }
      if (data.main) {
        const low = toCelcius(data.main.temp_min)
        const high = toCelcius(data.main.temp_max)
        str += low !== high ? ` ${low} to ${high} celcius.` : ` ${low} cecius`
      }
    }
    return str
  }).catch(e => 'No weather data available.')
}

module.exports = {
  getWeather
}
