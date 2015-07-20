describe "AlertsCtrl", ->
  scope = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      scope = $rootScope.$new()

      $controller "AlertsCtrl",
        $scope: scope,
        $stateParams: {}

      return

    return

  it "should have access to wallet alerts", inject(() ->
    expect(scope.alerts).toBeDefined()
  )