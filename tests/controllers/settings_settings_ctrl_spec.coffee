describe "SettingsCtrl", ->
  scope = undefined
  Wallet = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      scope = $rootScope.$new()

      $controller "SettingsCtrl",
        $scope: scope,
        $stateParams: {},

      scope.$digest()

      return

    return

  it "should load", inject((Wallet) ->
    spyOn(Wallet, "clearAlerts")
    scope.didLoad()
    expect(Wallet.clearAlerts).toHaveBeenCalled()
    expect(scope.status).toBe(Wallet.status)
    return
  )