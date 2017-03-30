describe "SettingsAccountsController", ->
  scope = undefined
  $uibModal = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      $uibModal = $injector.get("$uibModal")

      Wallet.accounts = () -> [{},{}]
      Wallet.my.wallet = {
        addressBook: {}
      }

      Wallet.status.isLoggedIn = true

      scope = $rootScope.$new()

      $controller "SettingsAccountsController",
        $scope: scope,
        $stateParams: {}

  it "should open modal to create a new account",  inject(() ->
    spyOn($uibModal, "open").and.callThrough()
    scope.newAccount()
    expect($uibModal.open).toHaveBeenCalled()
  )

  it "should list accounts",  inject(() ->
    expect(scope.accounts().length).toBeGreaterThan(1)
  )

  it "should open modal to transfer funds",  inject(() ->
    spyOn($uibModal, "open").and.callThrough()
    scope.transfer()
    expect($uibModal.open).toHaveBeenCalled()
  )
