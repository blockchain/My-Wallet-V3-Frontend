describe "CoinifyEmailComponentController", ->
  ctrlName = "coinifyEmail"
  ctrl = undefined
  bindings = undefined
  Wallet = undefined
  $rootScope = undefined
  $componentController = undefined

  func = jasmine.any(Function)

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$componentController_, _$q_, _$timeout_) ->
      $rootScope = _$rootScope_
      $componentController = _$componentController_
      $q = _$q_

      bindings =
        email: "test@example.com"
        verified: false
        onComplete: jasmine.createSpy('onComplete')

      Wallet = $injector.get("Wallet")
      Wallet.goal = {}
      Wallet.changeEmail = (email, succ, err) -> succ()
      Wallet.resendEmailConfirmation = () -> $q.resolve()

  describe "$onInit", ->
    beforeEach ->
      spyOn(Wallet, "resendEmailConfirmation")
      ctrl = $componentController(ctrlName, null, bindings)

    it "should send resend email if not verified", ->
      ctrl.$onInit()
      expect(Wallet.resendEmailConfirmation).toHaveBeenCalled()

    it "should not send resend email if user just created a wallet", ->
      Wallet.goal.firstLogin = true
      ctrl.$onInit()
      expect(Wallet.resendEmailConfirmation).not.toHaveBeenCalled()

  describe "$onChanges", ->
    it "should complete step if verified is true", ->
      ctrl = $componentController(ctrlName, null, bindings)
      expect(bindings.onComplete).not.toHaveBeenCalled()
      ctrl.$onChanges(verified: currentValue: 1)
      expect(bindings.onComplete).toHaveBeenCalled()

  describe "toggleEditing", ->
    it "should toggle", ->
      ctrl = $componentController(ctrlName, null, bindings)
      expect(ctrl.state.editing).toEqual(false)
      ctrl.toggleEditing()
      expect(ctrl.state.editing).toEqual(true)
      ctrl.toggleEditing()
      expect(ctrl.state.editing).toEqual(false)

  describe "changeEmail", ->
    beforeEach ->
      ctrl = $componentController(ctrlName, null, bindings)
      ctrl.state.editing = true

    it "should call Wallet.changeEmail with correct args", ->
      spyOn(Wallet, "changeEmail").and.callThrough()
      ctrl.changeEmail(bindings.email)
      expect(Wallet.changeEmail).toHaveBeenCalledWith(bindings.email, func, func)

    it "should call success callback", ->
      success = jasmine.createSpy('success')
      ctrl.changeEmail(bindings.email, success)
      $rootScope.$digest()
      expect(success).toHaveBeenCalled()

    it "should set editing to false", ->
      ctrl.changeEmail()
      $rootScope.$digest()
      expect(ctrl.state.editing).toEqual(false)
