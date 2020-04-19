const snoowrap = require('snoowrap')
const axios = require('axios').default
const qs = require('querystring')
const _ = require('lodash')

const API_ERR= 'Request unavailable, please try again later.'
const INVALID_ARG = 'I do not understand your command, please consult the help page or contact the dev using \`.todev\`.'
const INVALID_OFFSET = 'Offset must be a number between 0 and 100'

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

const getPost = (subName, args) =>
  getRequester().then(r => {
    const subReddit = r.getSubreddit(subName)
    if (_.isEmpty(args)) {
      // get random post if no args
      return subReddit.getRandomSubmission().then(res => ({
        err: null,
        res
      }))
    }
    const flag = args[0]
    const validTimes = ['all', 'hour', 'day', 'week', 'month', 'year']
    if (flag === 'top') {
      let time = 'day'
      let limit = 1
      if (args.length > 1 && _.includes(validTimes, args[1])) {
        time = args[1].toLowerCase()
        if (args.length > 2) {
          const offset = parseInt(args[2])
          if (!isNaN(offset) && offset >= 0 && offset <= 100) {
            limit += offset
          } else {
            return Promise.resolve({ err: INVALID_OFFSET, res: null})
          }
        }
      }
      return subReddit.getTop({ time, limit }).then(posts => {
        if (_.isEmpty(posts)) {
          return { err: API_ERR, res: null }
        }
        const post = posts[posts.length - 1]
        return { err: null, res: post }
      })
    }
    return Promise.resolve({ err: INVALID_ARG, res: null})
  })

const getMeme = args =>
  getPost('dankmemes', args).then(({err, res}) => {
    if (!res || !res.url) {
      return { text: err }
    } else {
      return {
        text: `Dank memes! ${res.url}`,
        options: null
      }
    }
  }).catch(() => {
    return { text: API_ERR }
  })

const getFloridaMan = args =>
  getPost('floridaman', args).then(({err, res})  => {
    if (!res || !res.title || !res.url) {
      return { text: err }
    } else {
      return {
        text: `${res.title} ${res.url}`,
        options: null
      }
    }
  }).catch(() => {
    return { text: API_ERR }
  })

  const getEarthPorn = args =>
  getPost('earthporn', args).then(({err, res})  => {
    if (!res || !res.title || !res.url) {
      return { text: err }
    } else {
      return {
        text: `${res.title} ${res.url}`,
      }
    }
  }).catch(() => {
    return { text: API_ERR }
  })

module.exports = {
  getMeme,
  getFloridaMan,
  getEarthPorn
}
