describe "TransactionCtrl", ->
  scope = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      Wallet.login("test", "test") 

      scope = $rootScope.$new()

      $controller "TransactionCtrl",
        $scope: scope,
        $stateParams: {}

      return

    return

  it "should have access to transactions",  inject(() ->
    expect(scope.transactions).toBeDefined()
  )

  it "should have access to accounts",  inject(() ->
    expect(scope.accounts).toBeDefined()
  )

  it "should have access to address book",  inject(() ->
    expect(scope.addressBook).toBeDefined()
  )
