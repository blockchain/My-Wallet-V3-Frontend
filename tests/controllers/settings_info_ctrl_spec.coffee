describe "SettingsInfoCtrl", ->
  scope = undefined
  Wallet = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      Wallet.status.isLoggedIn = true

      scope = $rootScope.$new()

      $controller "SettingsInfoCtrl",
        $scope: scope,
        $stateParams: {},

      scope.$digest()

      return

    return

  it "should show pairing code", inject((Wallet, Alerts) ->
    spyOn(Wallet, "makePairingCode")
    spyOn(Alerts, "displayError")

    scope.showPairingCode()

    expect(Wallet.makePairingCode).toHaveBeenCalled()
    expect(Alerts.displayError).not.toHaveBeenCalled()

    return
  )

  it "can hide pairing code", ->
    scope.hidePairingCode()
    expect(scope.pairingCode).toBe(null)
    expect(scope.display.pairingCode).toBe(false)
    return
