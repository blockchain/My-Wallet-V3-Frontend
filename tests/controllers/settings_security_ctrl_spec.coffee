describe "SettingsSecurityCtrl", ->
  scope = undefined
  Wallet = undefined

  modal =
    open: ->

  mockObserver = {
    success: (() ->),
    error: (() ->)}

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")

      Wallet.settings = {rememberTwoFactor: true}

      Wallet.user = {passwordHint: "Open sesame"}

      Wallet.settings_api =
        updatePasswordHint1: (hint, success, error) ->
          if hint == "आपकी पसंदीदा"
            error(101)
          else
            success()

      scope = $rootScope.$new()

      $controller "SettingsSecurityCtrl",
        $scope: scope,
        $stateParams: {},
        $uibModal: modal

      scope.$digest()

      return

    return

  it "should have access to wallet settings", inject((Wallet) ->
    expect(scope.settings).toBe(Wallet.settings)
    return
  )

  it "should have access to user object", inject((Wallet) ->
    expect(scope.user).toBe(Wallet.user)
    return
  )

  describe "pbkdf2", ->

    it "should be valid Pbkdf2", ->
      expect(scope.validatePbkdf2(1)).toBe(true)
      expect(scope.validatePbkdf2(0)).toBe(false)

    it "can set Pbkdf2", inject((Wallet, Alerts) ->
      spyOn(Wallet, "setPbkdf2Iterations")
      spyOn(Alerts, "displayError")
      scope.changePbkdf2(10)
      expect(Wallet.setPbkdf2Iterations).toHaveBeenCalled()
      expect(Alerts.displayError).not.toHaveBeenCalled()

      return
    )

  describe "remember 2FA", ->

    it "has an initial status", ->
      expect(scope.settings.rememberTwoFactor).toBe(true)
      return

    it "can be enabled", inject((Wallet) ->
      spyOn(Wallet, "enableRememberTwoFactor")
      scope.enableRememberTwoFactor()
      expect(Wallet.enableRememberTwoFactor).toHaveBeenCalled()

      return
    )

    it "can be disabled", inject((Wallet) ->
      spyOn(Wallet, "disableRememberTwoFactor")
      scope.disableRememberTwoFactor()
      expect(Wallet.disableRememberTwoFactor).toHaveBeenCalled()

      return
    )

  describe "password", ->
    it "can be changed through modal", inject(($uibModal) ->
      spyOn(modal, "open")
      scope.changePassword()
      expect(modal.open).toHaveBeenCalled()
    )

    return

  describe "password hint", ->

    it "should let user change it", inject((Wallet) ->
      spyOn(Wallet, "changePasswordHint")
      scope.edit.passwordHint = false

      scope.changePasswordHint("Other hint", mockObserver.success, mockObserver.error)


      expect(Wallet.changePasswordHint).toHaveBeenCalled()

      return
    )

    it "should not change to an improper value", inject((Wallet) ->
      scope.edit.passwordHint = false
      expect(scope.errors.passwordHint).not.toBeDefined()

      scope.changePasswordHint("आपकी पसंदीदा", mockObserver.success, mockObserver.error)
      expect(scope.errors.passwordHint).toBeDefined()

      return
    )
  describe "whitelist", ->

    describe "whitelist validation", ->

      it "should return false", ->
        expect(scope.validateIpWhitelist(undefined)).toBe(false)

      it "should return MAX_CHARACTERS error", ->
        n = ''
        for i in [0..255] by 1
          n += 'a'
        expect(scope.validateIpWhitelist(n)).toBe(false)

      it "should return MAX_IP_ADDRESSES error", ->
        n = '1.1.1.1'
        for i in [0..15] by 1
          n += ',1.1.1.1'
        expect(scope.validateIpWhitelist(n)).toBe(false)

      it "should return NOT_ALLOWED error", ->
        expect(scope.validateIpWhitelist('%.%.%.%')).toBe(false)

      it "should return true, no errors", ->
        expect(scope.validateIpWhitelist('1.2.3.4')).toBe(true)

      it "should allow an empty list", ->
        expect(scope.validateIpWhitelist('')).toBe(true)

    it "can change IP whitelist", inject((Wallet, Alerts) ->
      spyOn(Wallet, "setIPWhitelist")
      spyOn(Alerts, "displayError")
      scope.changeIpWhitelist([])
      expect(Wallet.setIPWhitelist).toHaveBeenCalled()
      expect(Alerts.displayError).not.toHaveBeenCalled()

      return
    )
