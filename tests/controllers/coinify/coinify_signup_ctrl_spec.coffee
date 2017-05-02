describe "CoinifySignupComponentController", ->
  ctrlName = "coinifySignup"
  ctrl = undefined
  bindings = undefined
  Wallet = undefined
  $rootScope = undefined
  $componentController = undefined
  buySell = undefined

  func = jasmine.any(Function)

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$componentController_, _$q_, _$timeout_) ->
      $rootScope = _$rootScope_
      $componentController = _$componentController_
      $q = _$q_

      bindings =
        email: "test@example.com"
        validEmail: true,
        onClose: jasmine.createSpy('onClose')
        onError: jasmine.createSpy('onError')
        onComplete: jasmine.createSpy('onComplete')
        onEmailChange: jasmine.createSpy('onEmailChange')
        fiatCurrency: () -> 'USD'

      Wallet = $injector.get("Wallet")
      Wallet.goal = {}
      Wallet.changeEmail = (email, succ, err) -> succ()
      Wallet.resendEmailConfirmation = () -> $q.resolve()
      
      buySell = $injector.get("buySell")
      buySell.getExchange = () -> {
        signup: () -> if ctrl.validEmail then $q.resolve() else $q.reject({error: 'EMAIL_ADDRESS_IN_USE'})
      }

  describe ".signup()", ->
    beforeEach ->
      ctrl = $componentController(ctrlName, null, bindings)

    it "should perform signup", ->
      ctrl.validEmail = true
      ctrl.signup()
      $rootScope.$digest()
      expect(ctrl.onComplete).toHaveBeenCalled()
    
    it "should handle signup errors", ->
      ctrl.validEmail = false
      ctrl.signup()
      $rootScope.$digest()
      expect(ctrl.onEmailChange).toHaveBeenCalled()
