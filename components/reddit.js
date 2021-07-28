const snoowrap = require('snoowrap')
const axios = require('axios').default
const qs = require('querystring')
const _ = require('lodash')
const numeral = require('numeral')

const API_ERR= 'Request unavailable, please try again later.'
const INVALID_ARG = 'I do not understand your command, please consult the help page or contact the dev using \`.todev\`.'
const INVALID_OFFSET = 'Offset must be a number between 0 and 100'
const INVALID_SORT = 'Sort type must be one of (hot, new, top)'

const getRequester = () => {
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

const getPostData = (subName, inputs) =>
  getRequester().then(r => {
    const subReddit = r.getSubreddit(subName)
    let args = inputs
    if (_.isEmpty(args)) {
      // get random post if no args
      return subReddit.getRandomSubmission().then(res => ({
        err: null,
        res
      }))
    }
    const flag = args[0].toLowerCase()
    const validSort = ['top', 'new', 'hot']
    if (!_.includes(validSort, flag)) {
      return Promise.resolve({ err: INVALID_SORT, res: null})
    }
    const validTimes = ['all', 'hour', 'day', 'week', 'month', 'year']
    let time = 'day'
    let limit = 1
    if (args.length > 1) {
      const offset = parseInt(args[1])
      if (isNaN(offset)) {
        // if not a number, then we assume offset is 0
        args = [...args.slice(0,1), 0,...args.slice(1)]
      } else if (offset < 0 || offset > 100) {
        return Promise.resolve({ err: INVALID_OFFSET, res: null})
      } else {
        limit += offset
      }
      if (args.length > 2 && _.includes(validTimes, args[2])) {
        time = args[2].toLowerCase()
      }
    }
    let promise = Promise.resolve([])
    if (flag === 'top') {
      promise = subReddit.getTop({ time, limit })
    } else if (flag === 'hot') {
      promise = subReddit.getHot({ time, limit })
    } else if (flag === 'new') {
      promise = subReddit.getNew({ time, limit })
    } else {
      // return error if flag is not recognized
      return Promise.resolve({ err: INVALID_ARG, res: null})
    }
    return promise.then(posts => {
      if (_.isEmpty(posts)) {
        return { err: API_ERR, res: null }
      }
      const post = posts[posts.length - 1]
      return { err: null, res: post }
    })
  })

const getScore = post => {
  const ups = parseInt(post.ups)
  const downs = parseInt(post.downs)
  if (!post || isNaN(ups) || isNaN(downs)) {
    return null
  }
  const score = ups - downs
  const text = numeral(score).format('0a')
  return score > 0 ? `+${text}` : text
}

const includeScore = (post, text) => {
  const score = getScore(post)
  return score ? `**(${score})** ${text}` : text
}

const getPost = (subreddit, args, message) =>
  getPostData(subreddit, args).then(({err, res}) => {
    if (!res || !res.url) {
      return { text: err }
    } else {
      return {
        text: includeScore(res,message),
        url: res.url,
        options: null
      }
    }
  }).catch(() => {
    return { text: API_ERR, url: null }
  })

const getPostWithTitle = (subreddit, args) =>
  getPostData(subreddit, args).then(({err, res})  => {
    if (!res || !res.title || !res.url) {
      return { text: err }
    } else {
      return {
        text: includeScore(res, res.title),
        url: res.url,
        options: null
      }
    }
  }).catch(() => {
    return { text: API_ERR, url: null }
  })

const appendUrl = res =>
  res.url ? `${res.text} ${res.url}` : res.text

const getMeme = args =>
  getPost('dankmemes', args, 'Dank memes!')

const getCreepy = args =>
  getPostWithTitle('creepy', args)

const getFloridaMan = args =>
  getPostWithTitle('floridaman', args)

const getEarthPorn = args =>
  getPostWithTitle('earthporn', args)

const getSpacePorn = args =>
  getPostWithTitle('spaceporn', args)

const getGoneCivil = args =>
  getPostWithTitle('gonecivil', args)

const getMeIRL = args =>
  getPostWithTitle('meirl', args)

const getSkyPorn = args =>
  getPostWithTitle('skyporn', args)

module.exports = {
  getMeme,
  getFloridaMan,
  getEarthPorn,
  getSpacePorn,
  getCreepy,
  getGoneCivil,
  appendUrl,
  getPost,
  getMeIRL,
  getSkyPorn
}
