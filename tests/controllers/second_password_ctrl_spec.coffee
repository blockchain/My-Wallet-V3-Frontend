describe "SecondPasswordCtrl", ->
  scope = undefined
  modalInstance =
    close: ->
    dismiss: ->

  $controller = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      scope = $rootScope.$new()

      $controller "SecondPasswordCtrl",
        $scope: scope,
        $stateParams: {},
        $modalInstance: modalInstance,
        insist: false
        continueCallback: (password) ->
        cancelCallback:  (() ->)

      spyOn(modalInstance, "close")

      return

    return

  it "should clear alerts", inject((Wallet) ->
    spyOn(Wallet, "clearAlerts")
    scope.cancel()
    expect(Wallet.clearAlerts).toHaveBeenCalled()
    return
  )

  it "should close the modal when password is correct", ->

    scope.secondPassword = "correct"

    scope.submit()

    expect(modalInstance.close).toHaveBeenCalled()

  it "should close the modal when password is wrong", ->
    scope.secondPassword = "wrong"

    scope.submit()
    expect(modalInstance.close).not.toHaveBeenCalled()
