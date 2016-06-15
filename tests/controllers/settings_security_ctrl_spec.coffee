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
