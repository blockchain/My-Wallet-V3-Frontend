describe "AccountsCtrl", ->
  scope = undefined
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      
      Wallet.login("test", "test")  
      
      scope = $rootScope.$new()
            
      $controller "AccountsCtrl",
        $scope: scope,
        $stateParams: {}
      
      return

    return
    
  it "should let user create a new address", ->
    before = scope.accounts.length
    scope.createAccount()
    expect(scope.accounts.length).toBe(before + 1)