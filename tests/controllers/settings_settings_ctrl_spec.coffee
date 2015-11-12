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

  it "should load", inject((Wallet, Alerts) ->
    spyOn(Alerts, "clear")
    scope.didLoad()
    expect(Alerts.clear).toHaveBeenCalled()
    expect(scope.status).toBe(Wallet.status)
    return
  )
