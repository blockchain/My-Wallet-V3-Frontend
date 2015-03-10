describe "ChangePasswordCtrl", ->
  scope = undefined
  Wallet = undefined
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

      $controller "ChangePasswordCtrl",
        $scope: scope,
        $stateParams: {},
        $modalInstance: modalInstance

      scope.$digest()

      return

    return

  it "should be able to close", inject((Wallet) ->
    spyOn(Wallet, "clearAlerts")
    scope.close()
    expect(Wallet.clearAlerts).toHaveBeenCalled()
  )

  it "should be able to change password", inject((Wallet) ->
    spyOn(Wallet, "changePassword")
    scope.changePassword()
    expect(Wallet.changePassword).toHaveBeenCalled()
  )