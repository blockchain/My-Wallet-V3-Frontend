describe "OpenLinkController", ->
  scope = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      Wallet.parsePaymentRequest = (url) ->

      scope = $rootScope.$new()

      $controller "OpenLinkController",
        $scope: scope,
        $stateParams: {}

      scope.$digest()

      return

    return

  it "should have access to Wallet", ->
    expect(Wallet).toBeDefined()