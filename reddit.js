const snoowrap = require('snoowrap')
const axios = require('axios').default
const qs = require('querystring')
const _ = require('lodash')

const getRequester = () => {
  // const r = new snoowrap({
  //   userAgent: 'web:wmloh:0.1.0 (by /u/dankat)',
  //   clientId: process.env.REDDIT_CLIENT_ID,
  //   clientSecret: process.env.REDDIT_CLIENT_SECRET,
  //   refreshToken: process.env.REDDIT_REFRESH_TOKEN
  // });
  const requestBody = {
    'grant_type': 'client_credentials'
  }
  return axios.post('https://www.reddit.com/api/v1/access_token',
    qs.stringify(requestBody),
    {
      auth: {
        username: process.env.REDDIT_CLIENT_ID,
        password: process.env.REDDIT_CLIENT_SECRET
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(response => {
      const r = new snoowrap({
        userAgent: 'web:wmloh:0.1.0 (by /u/dankat)',
        accessToken: _.get(response, 'data.access_token')
      });
      r.config({ proxies: false, requestDelay: 1000 });
      return r;
    });
}

const getMeme = () =>
  getRequester().then(r =>
    r.getSubreddit('dankmemes').getRandomSubmission()
  ).then(res => {
    if (!res || !res.url) {
      return null
    } else {
      return {
        text: 'Dank memes!',
        url: res.url
      }
    }
  }).catch(() => {
    return null
  })

const getFloridaMan = () =>
  getRequester().then(r =>
    r.getSubreddit('floridaman').getRandomSubmission()
  ).then(res => {
    if (!res || !res.title || !res.url) {
      return null
    } else {
      return `${res.title} ${res.url}`
    }
  }).catch(() => {
    return null
  })

const getEarthPorn = () =>
  getRequester().then(r =>
    r.getSubreddit('earthporn').getRandomSubmission()
  ).then(res => {
    if (!res || !res.title || !res.url) {
      return null
    } else {
      return {
        text: res.title,
        url: res.url
      }
    }
  }).catch(() => {
    return null
  })

module.exports = {
  getMeme,
  getFloridaMan,
  getEarthPorn
}
