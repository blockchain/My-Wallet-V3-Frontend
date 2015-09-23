describe "MobileCtrl", ->
  scope = undefined
  Wallet = undefined

  

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      scope = $rootScope.$new()

      $controller "MobileCtrl",
        $scope: scope,
        $stateParams: {},

      scope.$digest()

      return

    return

  it "should show pairing code", inject((Wallet) ->
    spyOn(Wallet, "makePairingCode")
    spyOn(Wallet, "displayError")

    scope.showPairingCode()

    expect(Wallet.makePairingCode).toHaveBeenCalled()
    expect(Wallet.displayError).not.toHaveBeenCalled()

    return
  )

  it "can hide pairing code", ->
    scope.hidePairingCode()
    expect(scope.pairingCode).toBe(null)
    expect(scope.display.pairingCode).toBe(false)
    return
