describe "SecondPasswordCtrl", ->
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

      $controller "SecondPasswordCtrl",
        $scope: scope,
        $stateParams: {},
        $modalInstance: modalInstance,
        insist: false

      return

    return

  it "should clear alerts", inject((Wallet) ->
    spyOn(Wallet, "clearAlerts")
    scope.cancel()
    expect(Wallet.clearAlerts).toHaveBeenCalled()
    return
  )

  it "should submit", inject((Wallet) ->
    spyOn(Wallet, "clearAlerts")
    spyOn(Wallet, "isCorrectSecondPassword")
    spyOn(Wallet, "displayError")

    scope.submit()

    expect(Wallet.clearAlerts).toHaveBeenCalled()
    expect(Wallet.isCorrectSecondPassword).toHaveBeenCalled()
    expect(Wallet.displayError).toHaveBeenCalled()

    return
  )