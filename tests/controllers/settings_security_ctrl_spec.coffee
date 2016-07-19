describe "SettingsSecurityCtrl", ->
  scope = undefined
  Wallet = undefined
  Alerts = undefined
  $uibModal = undefined
  $q = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller, _$q_) ->
      $q = _$q_
      Wallet = $injector.get("Wallet")
      Alerts = $injector.get("Alerts")
      $uibModal = $injector.get("$uibModal")

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
      scope.$digest()

  it "should have access to wallet settings", ->
    expect(scope.settings).toBe(Wallet.settings)

  it "should have access to user object", ->
    expect(scope.user).toBe(Wallet.user)

  describe "confirm recovery phrase", ->
    beforeEach ->
      spyOn(Alerts, "prompt").and.returnValue($q.resolve('asdf'))
      spyOn($uibModal, "open").and.callThrough()

    it "should open when second pw is enabled", ->
      scope.settings.secondPassword = true
      scope.confirmRecoveryPhrase()
      expect($uibModal.open).toHaveBeenCalled()

    it "should prompt for main password when second pw is not enabled", ->
      scope.confirmRecoveryPhrase()
      expect(Alerts.prompt).toHaveBeenCalled()

    it "should validate the main password", ->
      spyOn(Wallet, "isCorrectMainPassword").and.returnValue(true)

      scope.confirmRecoveryPhrase()
      expect(Alerts.prompt).toHaveBeenCalled()

      scope.$digest()
      expect($uibModal.open).toHaveBeenCalled()

    it "should display an error and retry if the main password was incorrect", ->
      spyOn(Alerts, "displayError").and.callThrough()
      spyOn(Wallet, "isCorrectMainPassword").and.returnValue(false)

      scope.confirmRecoveryPhrase()
      spyOn(scope, "confirmRecoveryPhrase")

      expect(Alerts.prompt).toHaveBeenCalled()
      scope.$digest()

      expect(Alerts.displayError).toHaveBeenCalled()
      expect(scope.confirmRecoveryPhrase).toHaveBeenCalled()

  describe "remember 2FA", ->
    it "has an initial status", ->
      expect(scope.settings.rememberTwoFactor).toBe(true)

    it "can be enabled", ->
      spyOn(Wallet, "enableRememberTwoFactor")
      scope.enableRememberTwoFactor()
      expect(Wallet.enableRememberTwoFactor).toHaveBeenCalled()

    it "can be disabled", ->
      spyOn(Wallet, "disableRememberTwoFactor")
      scope.disableRememberTwoFactor()
      expect(Wallet.disableRememberTwoFactor).toHaveBeenCalled()
