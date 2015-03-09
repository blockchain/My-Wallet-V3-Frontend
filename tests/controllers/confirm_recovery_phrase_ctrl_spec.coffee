describe "ConfirmRecoveryPhraseCtrl", ->
  scope = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      Wallet.login("test", "test") 

      scope = $rootScope.$new()

      $controller "ConfirmRecoveryPhraseCtrl",
        $scope: scope,
        $stateParams: {}

      return

    return