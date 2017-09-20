/* eslint-disable semi */
angular
  .module('walletApp')
  .factory('Condition', () => Condition)

let flatMap = (f, xs) => xs.reduce((acc, x) => acc.concat(f(x)), [])

class Condition {
  constructor (f) {
    this.test = f
  }

  is (otherCondition) {
    return Condition.of((env) => {
      let r1 = this.test(env)
      let r2 = otherCondition.test(env)
      let passed = r1.passed && r2.passed
      let reason = flatMap(r => r.reason, [r1, r2].filter(r => r.passed === passed))
      return { passed, reason }
    })
  }

  isNot (otherCondition) {
    return this.is(otherCondition.negated())
  }

  or (otherCondition) {
    return Condition.of((env) => {
      let r = this.test(env)
      return r.passed ? r : otherCondition.test(env)
    })
  }

  negated () {
    return Condition.of((env) => {
      let { passed, reason } = this.test(env)
      return { passed: !passed, reason }
    })
  }

  static empty () {
    return Condition.of(() => ({
      passed: true,
      reason: []
    }))
  }

  static of (f) {
    return new Condition(f)
  }

  static format (title, { passed, reason }) {
    let reasons = reason.slice(0, -1)
    let lastReason = reason[reason.length - 1]
    return (
      `User can${passed ? '' : 'not'} see ${title} because ` +
      `${reasons.length ? reasons.join(', ') + ' and ' : ''}${lastReason}.`
    )
  }
}

Condition.inRolloutGroup = Condition.of(({ user, options }) => {
  let passed = (
    options.rolloutFraction === 1
  )
  return {
    passed,
    reason: [`they are ${passed ? '' : 'not '}in the rollout group`]
  }
})

Condition.inStateWhitelist = Condition.of(({ user, options }) => {
  let passed = (
    user.stateCodeGuess == null ||
    options.statesWhitelist.indexOf(user.stateCodeGuess) > -1
  )
  return {
    passed,
    reason: [`they are ${passed ? '' : 'not '}in the state whitelist`]
  }
})

Condition.inCountryBlacklist = Condition.of(({ user, options }) => {
  let passed = (
    user.countryCodeGuess == null ||
    options.countriesBlacklist.indexOf(user.countryCodeGuess) > -1
  )
  return {
    passed,
    reason: [`they are ${passed ? '' : 'not '}in the country blacklist`]
  }
})
