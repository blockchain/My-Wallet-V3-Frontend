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
        $uibModalInstance: modalInstance

      scope.$digest()

      return

    return

  it "should close", inject((Alerts) ->
    spyOn(Alerts, "clear")
    scope.close()
    expect(Alerts.clear).toHaveBeenCalled()
  )

  it "cover setSecondPassword if scope is valid and not busy", ->
    scope.isValid = true
    scope.busy = false
    scope.setPassword()

  it "should validate if the password is longer than 3 chars", ->
    scope.fields.password = 'helloworld'
    scope.validate()
    expect(scope.success.password).toBe(true)

  it "should not validate if the password is shorter than 3 chars", ->
    scope.fields.password = 'he'
    scope.validate()
    expect(scope.success.password).toBe(false)

  it "should validate if the confirmation is the same as the password", ->
    scope.fields.password = 'helloworld'
    scope.fields.confirmation = 'helloworld'

    scope.validate()

    expect(scope.success.confirmation).toBe(true)

  it "should not validate if the confirmation is different than the password", ->
    scope.fields.password = 'helloworld'
    scope.fields.confirmation = 'helloworl'

    scope.validate()

    expect(scope.success.confirmation).toBe(false)