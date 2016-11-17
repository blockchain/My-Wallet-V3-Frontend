
describe "SfoxSignupController", ->
  $rootScope = undefined
  $controller = undefined

  profile = (status) -> verificationStatus: status
  accounts = (first) -> if first then [first] else []

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $q, _$rootScope_, _$controller_) ->
      $rootScope = _$rootScope_
      $controller = _$controller_

  getController = (profile, accounts) ->
    $controller "SfoxSignupController",
      exchange: { profile: profile }
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

  describe "setStep", ->
    it "should go to 'create' when there is no profile", ->
      ctrl = getController()
      expect(ctrl.onStep('create')).toEqual(true)

    it "should go to 'verify' if profile is unverified", ->
      ctrl = getController(profile('unverified'))
      expect(ctrl.onStep('verify')).toEqual(true)

    it "should go to 'link' if user does not have an account", ->
      ctrl = getController(profile('verified'), accounts())
      expect(ctrl.onStep('link')).toEqual(true)

    it "should go to 'link' if user does not have an active account", ->
      ctrl = getController(profile('verified'), accounts(status: 'pending'))
      expect(ctrl.onStep('link')).toEqual(true)

    it "should go to 'buy' if user is verified and has account", ->
      ctrl = getController(profile('verified'), accounts(status: 'active'))
      expect(ctrl.onStep('buy')).toEqual(true)
