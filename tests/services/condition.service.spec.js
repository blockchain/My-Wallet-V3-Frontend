describe('Condition', () => {
  let Condition
  let presets = {}

  beforeEach(angular.mock.module('walletApp'))

  beforeEach(() => angular.mock.inject(($injector) => {
    Condition = $injector.get('Condition')

    presets.passed = Condition.of(() => ({
      passed: true,
      reason: ['this is a passed condition']
    }))

    presets.failed = Condition.of(() => ({
      passed: false,
      reason: ['this is a failed condition']
    }))
  }))

  describe('#empty', () => {
    it('should create an empty condition', () => {
      let c = Condition.empty()
      expect(c.test()).toEqual({ passed: true, reason: [] })
    })
  })

  describe('#of', () => {
    it('should create a new condition', () => {
      let c = Condition.of(() => ({
        passed: false,
        reason: ['just because']
      }))
      expect(c.test()).toEqual({ passed: false, reason: ['just because'] })
    })
  })

  describe('#format', () => {
    it('should format a passing condition', () => {
      let s = Condition.format('this feature', presets.passed.test())
      expect(s).toEqual('User can see this feature because this is a passed condition.')
    })

    it('should format a failing condition', () => {
      let s = Condition.format('this feature', presets.failed.test())
      expect(s).toEqual('User cannot see this feature because this is a failed condition.')
    })

    it('should format a composite condition', () => {
      let c = Condition.empty().is(presets.passed).isNot(presets.failed)
      let s = Condition.format('this feature', c.test())
      expect(s).toEqual('User can see this feature because this is a passed condition and this is a failed condition.')
    })

    it('should format a complex composite condition', () => {
      // failed || (passed && !failed) -> passed
      let c = Condition.empty()
        .is(presets.failed)
        .or(Condition.empty()
          .is(presets.passed)
          .isNot(Condition.empty().is(presets.failed))
        )
      let s = Condition.format('this feature', c.test())
      expect(s).toEqual('User can see this feature because this is a passed condition and this is a failed condition.')
    })
  })

  describe('.is', () => {
    it('should create a composite condition', () => {
      let c = Condition.empty().is(presets.failed)
      expect(c.test()).toEqual({ passed: false, reason: ['this is a failed condition'] })
    })
  })

  describe('.isNot', () => {
    it('should create a composite negated condition', () => {
      let c = Condition.empty().isNot(presets.passed)
      expect(c.test()).toEqual({ passed: false, reason: ['this is a passed condition'] })
    })
  })

  describe('.or', () => {
    it('should create a passing condition if one branch passes', () => {
      let c1 = presets.passed.or(presets.failed)
      let c2 = presets.failed.or(presets.passed)
      expect(c1.test()).toEqual({ passed: true, reason: ['this is a passed condition'] })
      expect(c2.test()).toEqual({ passed: true, reason: ['this is a passed condition'] })
    })

    it('should create a failing condition if both branches fail', () => {
      let c = presets.failed.or(presets.failed)
      expect(c.test()).toEqual({ passed: false, reason: ['this is a failed condition'] })
    })
  })

  describe('.negated', () => {
    it('should negate a passing condition', () => {
      let c = presets.passed.negated()
      expect(c.test()).toEqual({ passed: false, reason: ['this is a passed condition'] })
    })

    it('should negate a failing condition', () => {
      let c = presets.failed.negated()
      expect(c.test()).toEqual({ passed: true, reason: ['this is a failed condition'] })
    })
  })
})
