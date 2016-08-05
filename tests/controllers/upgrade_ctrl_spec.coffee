describe "UpgradeCtrl", ->
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

      $controller "UpgradeCtrl",
        $scope: scope,
        $stateParams: {},
        $uibModalInstance: modalInstance

      return

    return

  it "should set waiting to false after timeout", inject(($timeout) ->
    $timeout.flush()
    expect(scope.waiting).toBeFalsy()
  )

  it "should proceed if user agrees", ->
    spyOn(Wallet, "upgrade")

    scope.upgrade()
    expect(Wallet.upgrade).toHaveBeenCalled()
