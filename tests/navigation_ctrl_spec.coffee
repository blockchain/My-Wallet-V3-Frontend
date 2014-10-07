describe "NavigationCtrl", ->
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
            
      $controller "NavigationCtrl",
        $scope: scope,
        $stateParams: {}
      
      return

    return
  
  it "should have access to login status",  inject(() ->
    expect(scope.status.isLoggedIn).toBe(true)
  )
  
