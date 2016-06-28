describe "SettingsInfoCtrl", ->
  scope = undefined
  Wallet = undefined
  Alerts = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      Alerts = $injector.get("Alerts")

      Wallet.makePairingCode = (success, error) ->
        if scope.pairingCode then error() else success("code")

      scope = $rootScope.$new()

      $controller "SettingsInfoCtrl",
        $scope: scope

      scope.$digest()

  describe "show pairing code", ->
    afterEach ->
      expect(scope.loading).toEqual(false)

    it "should show pairing code if valid", ->
      scope.showPairingCode()
      scope.$digest()
      expect(scope.pairingCode).toEqual("code")

    it "should show an error when failed", ->
      spyOn(Alerts, "displayError")
      scope.pairingCode = "code"
      scope.showPairingCode()
      scope.$digest()
      expect(Alerts.displayError).toHaveBeenCalled()

  it "should hide the pairing code", ->
    scope.pairingCode = "code"
    scope.hidePairingCode()
    expect(scope.pairingCode).toEqual(null)
