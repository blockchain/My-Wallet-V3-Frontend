describe "UpgradeCtrl", ->
  scope = undefined
  modalInstance =
    close: ->
    dismiss: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      Wallet.login("test", "test") 

      scope = $rootScope.$new()

      $controller "UpgradeCtrl",
        $scope: scope,
        $stateParams: {},
        $modalInstance: modalInstance

      return

    return

  it "covers close", ->
    scope.close()
    return

  it "covers cancel", ->
    scope.cancel()
    return