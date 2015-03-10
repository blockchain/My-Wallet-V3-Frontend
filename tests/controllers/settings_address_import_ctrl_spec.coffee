describe "AddressImportCtrl", ->
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

      $controller "AddressImportCtrl",
        $scope: scope,
        $stateParams: {},
        $modalInstance: modalInstance

      scope.$digest()

      return

    return

  it "should have access to wallet accounts", inject((Wallet) ->
    expect(scope.accounts).toBe(Wallet.accounts)
    return
  )

  it "should correctly check for validity", ->
    expect(scope.isValid()).toBe(true)
    scope.errors["an_error"] = 'err'
    scope.$apply()
    expect(scope.isValid()).toBe(false)