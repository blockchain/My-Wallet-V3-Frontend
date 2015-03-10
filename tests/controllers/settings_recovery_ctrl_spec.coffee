describe "RecoveryCtrl", ->
  scope = undefined
  Wallet = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      scope = $rootScope.$new()

      $controller "RecoveryCtrl",
        $scope: scope,
        $stateParams: {},

      scope.$digest()

      return

    return

  it "should have wallet status", inject((Wallet) ->
    expect(scope.status).toBe(Wallet.status)
    return
  )

  it "does toggle recovery phrase", inject((Wallet) ->
    spyOn(Wallet, "getMnemonic")
    scope.toggleRecoveryPhrase()
    expect(Wallet.getMnemonic).toHaveBeenCalled()
    return
  )