describe "SettingsInfoCtrl", ->
  scope = undefined
  Wallet = undefined
  pairingCode = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      Wallet.status.isLoggedIn = true
      Wallet.makePairingCode = (success, error) ->
        if scope.pairingCode
          success()
        else
          error()

      scope = $rootScope.$new()

      $controller "SettingsInfoCtrl",
        $scope: scope,
        $stateParams: {},

      scope.$digest()

      return

    return

  describe "show pairing code", ->
    it "should show pairing code if valid", ->
      success = () ->
      error = () ->

      scope.pairingCode = 'code'
      scope.showPairingCode()
      Wallet.makePairingCode(success, error)
      expect(scope.display.pairingCode).toBe(true)

    it "should show an error when failed", inject((Alerts) ->
      success = () ->
      error = () ->
      spyOn(Alerts, "displayError")

      scope.showPairingCode()
      Wallet.makePairingCode(success, error)
      expect(Alerts.displayError).toHaveBeenCalled()
    )


  it "can hide pairing code", ->
    scope.hidePairingCode()
    expect(scope.pairingCode).toBe(null)
    expect(scope.display.pairingCode).toBe(false)
    return
