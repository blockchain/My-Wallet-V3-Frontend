describe "SettingsAddressesCtrl", ->
  scope = undefined
  Wallet = undefined

  modal =
    open: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")

      Wallet.accounts = () -> []

      scope = $rootScope.$new()

      $controller "SettingsAddressesCtrl",
        $scope: scope,
        $stateParams: {}
        Wallet: Wallet

      return

    return
