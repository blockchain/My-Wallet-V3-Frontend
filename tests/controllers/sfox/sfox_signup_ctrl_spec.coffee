describe "SfoxSignupController", ->
  $rootScope = undefined
  $controller = undefined

  profile = (status, docs) -> verificationStatus: { level: status, required_docs: docs }
  accounts = (first) -> if first then [first] else []

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $q, _$rootScope_, _$controller_) ->
      $rootScope = _$rootScope_
      $controller = _$controller_

  getController = (profile, accounts, quote) ->
    $controller "SfoxSignupController",
      $uibModalInstance: { close: (->) dismiss: (->) }
      exchange: { profile: profile }
      quote: quote || {}
      accounts: accounts || []

  describe "steps", ->
    ctrl = undefined
    beforeEach -> ctrl = getController()

    it "should have goTo correctly implemented", ->
      ctrl.goTo('buy')
      expect(ctrl.step).toEqual(ctrl.steps['buy'])

    it "should have onStep correctly implemented", ->
      ctrl.goTo('buy')
      expect(ctrl.onStep('buy')).toEqual(true)

  describe "initial step", ->
    it "should be 'create' when there is no profile", ->
      ctrl = getController()
      expect(ctrl.onStep('create')).toEqual(true)

    it "should be 'verify' if profile is unverified", ->
      ctrl = getController(profile('unverified'))
      expect(ctrl.onStep('verify')).toEqual(true)

    it "should be 'verify' if profile is pending verification and needs docs", ->
      ctrl = getController(profile('pending', ['id']))
      expect(ctrl.onStep('verify')).toEqual(true)

    it "should be 'link' if profile is pending verification and does not need docs", ->
      ctrl = getController(profile('pending'))
      expect(ctrl.onStep('link')).toEqual(true)

    it "should be 'link' if user does not have an account", ->
      ctrl = getController(profile('verified'), accounts())
      expect(ctrl.onStep('link')).toEqual(true)

    it "should be 'link' if user does not have an active account", ->
      ctrl = getController(profile('verified'), accounts(status: 'pending'))
      expect(ctrl.onStep('link')).toEqual(true)

    it "should be 'buy' if user is verified and has account", ->
      ctrl = getController(profile('verified'), accounts(status: 'active'))
      expect(ctrl.onStep('buy')).toEqual(true)
