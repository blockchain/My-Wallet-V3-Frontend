describe "AccountsCtrl", ->
  scope = undefined
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, $timeout, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      
      Wallet.login("uid", "pwd")  
      $timeout.flush()
      $timeout.flush()
      
      scope = $rootScope.$new()
            
      $controller "AccountsCtrl",
        $scope: scope,
        $stateParams: {}
      
      return

    return
    
  it "should let user create a new address", ->
    before = scope.accounts.length
    scope.generateAccount()
    expect(scope.accounts.length).toBe(before + 1)