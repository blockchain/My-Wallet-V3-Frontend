describe "TwoFactorCtrl", ->
  scope = undefined
  Wallet = undefined
  modalInstance =
    close: ->
    dismiss: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")

      Wallet.login("test", "test")

      Wallet.settings.twoFactorMethod = null
      Wallet.settings.needs2FA = false

      scope = $rootScope.$new()

      $controller "TwoFactorCtrl",
        $scope: scope,
        $modalInstance: modalInstance

      scope.$apply()

      return

    return

  it "should exist",  () ->
    expect(scope.close).toBeDefined()

  it "should go to step", () ->
    scope.goToStep('success')
    expect(scope.step).toBe('success')

  it "should know the current step", () ->
    expect(scope.isStep(scope.step)).toBe(true)

  describe "enable", ->

    it "should start at step 'enable'", () ->
      expect(scope.step).toBe('enable')

    describe "with SMS", ->

      it "should try to configure mobile if needed", () ->
        scope.authWithPhone()
        expect(scope.step).toBe('configure_mobile')

      it "should set 2FA to SMS if mobile is verified", () ->
        scope.user.isMobileVerified = true
        scope.authWithPhone()
        expect(scope.settings.needs2FA).toBe(true)
        expect(scope.settings.twoFactorMethod).toBe(5)

    describe "with app", ->

      beforeEach ->
        scope.authWithApp()

      it "should be on step 'pair'", () ->
        expect(scope.step).toBe('pair')

      it "should have google authenticator secret", () ->
        expect(scope.settings.googleAuthenticatorSecret).toBeDefined()

  describe "disable", ->

    beforeEach ->
      angular.mock.inject ($injector) ->
      
        Wallet = $injector.get("Wallet")      
      
        Wallet.settings.twoFactorMethod = 5
        Wallet.settings.needs2FA = true

    it "should start at step 'disable'", () ->
      scope.step = if scope.settings.needs2FA then 'disable' else 'enable'
      expect(scope.step).toBe('disable')

    it "should go to step 'disabled'", () ->
      scope.disableTwoFactor()
      expect(scope.step).toBe('disabled')

    it "should change twoFactorMethod to null", () ->
      scope.disableTwoFactor()
      expect(scope.settings.twoFactorMethod).toBe(null)

    it "should change needs2FA to false", () ->
      scope.disableTwoFactor()
      expect(scope.settings.needs2FA).toBe(false)