describe "UpgradeCtrl", ->
  scope = undefined
  Wallet = undefined

  modalInstance =
    close: ->
    dismiss: ->

  

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")

      scope = $rootScope.$new()

      $controller "UpgradeCtrl",
        $scope: scope,
        $stateParams: {},
        $modalInstance: modalInstance

      return

    return

  it "should proceed if user agrees", inject(() ->
    spyOn(Wallet, "upgrade")
    scope.upgrade()
    expect(Wallet.upgrade).toHaveBeenCalled()
  )

  it "covers cancel", ->
    spyOn(scope, 'goToBlockchain')
    scope.cancel()
    expect(scope.goToBlockchain).toHaveBeenCalled()

