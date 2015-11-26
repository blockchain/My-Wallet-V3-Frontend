describe "SecondPasswordCtrl", ->
  scope = undefined
  modalInstance =
    close: ->
    dismiss: ->

  $controller = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller, $q) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      MyWallet.wallet = {
        validateSecondPassword: (password) ->
          password == 'correct_password'
      }

      scope = $rootScope.$new()

      $controller "SecondPasswordCtrl",
        $scope: scope,
        $stateParams: {},
        $uibModalInstance: modalInstance,
        insist: false
        defer: $q.defer()

      spyOn(modalInstance, "close")

      return

    return

  it "should clear alerts", inject((Alerts) ->
    spyOn(Alerts, "clear")
    scope.cancel()
    expect(Alerts.clear).toHaveBeenCalled()
  )

  it "should close the modal when password is correct", ->
    scope.secondPassword = "correct_password"
    scope.submit()
    expect(modalInstance.close).toHaveBeenCalled()

  it "should close the modal when password is wrong", ->
    scope.secondPassword = "wrong_password"
    scope.submit()
    expect(modalInstance.close).not.toHaveBeenCalled()
