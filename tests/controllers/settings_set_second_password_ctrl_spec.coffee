describe "SetSecondPasswordCtrl", ->
  scope = undefined
  Wallet = undefined
  modalInstance =
    close: ->
    dismiss: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")

      scope = $rootScope.$new()

      $controller "SetSecondPasswordCtrl",
        $scope: scope,
        $stateParams: {},
        $modalInstance: modalInstance

      scope.$digest()

      return

    return

  it "should close", inject((Alerts) ->
    spyOn(Alerts, "clear")
    scope.close()
    expect(Alerts.clear).toHaveBeenCalled()
  )

  it "cover setSecondPassword", ->
    scope.setPassword()
