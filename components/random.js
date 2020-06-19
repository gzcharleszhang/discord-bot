const _ = require('lodash')

const coinflip = args => {
  const FLIP_LIMIT = 42069420
    if (_.isEmpty(args)) {
      const side = Math.random() > 0.5 ? 'Heads.' : 'Tails.'
      return side
    } else {
      const numFlips = parseInt(args[0])
      if (isNaN(numFlips)) {
        return 'Invalid number of times.'
      } else {
        if (numFlips > FLIP_LIMIT) {
          return `Maximum number of flips is ${FLIP_LIMIT}.`
        }
        let hc = 0
        let tc = 0
        for (let i = 0; i < numFlips; i++) {
          if (Math.random() <= 0.5) {
            hc++
          } else {
            tc++
          }
        }
        return `${hc} heads, ${tc} tails.`
      }
    }
}

const dice = args => {
  const ULIMIT = 42069420
  const LLIMIT = 1
  const DEFAULT_SIDES = 6
  const numSides = _.isEmpty(args) ? DEFAULT_SIDES : parseInt(args[0])
  if (isNaN(numSides)) {
    return 'Invalid number of sides.'
  } else if (numSides < LLIMIT || numSides > ULIMIT) {
    return `The number of sides must be within ${LLIMIT} and ${ULIMIT}`
  }
  const res = Math.floor(Math.random() * numSides) + 1
  return `You rolled a ${res} on a ${numSides}-sided dice.`
}

module.exports = {
  coinflip,
  dice
}
