describe "WalletCtrl", ->
  scope = undefined
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, $timeout, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      
      Wallet.login("uid", "pwd")  
      $timeout.flush()
      
      scope = $rootScope.$new()
            
      $controller "WalletCtrl",
        $scope: scope,
        $stateParams: {}
      
      return

    return
    
  it "should let user create a new address", ->
    expect(scope.addresses.length).toBe(0)
    scope.generateAddress()
    expect(scope.addresses.length).toBe(1)
    
  it "should redirect to dashboard if not logged in",  inject((Wallet, $state) ->
    Wallet.logout()
    expect(scope.status.isLoggedIn).toBe(false)
    
    spyOn($state, "go")    
    scope.didLoad()
      
    expect($state.go).toHaveBeenCalledWith("dashboard")
  )
  
  it "should not redirect to dashboard if not logged in",  inject((Wallet, $state) ->
    expect(scope.status.isLoggedIn).toBe(true)
    
    spyOn($state, "go")    
    scope.didLoad()
    
    expect($state.go).not.toHaveBeenCalled()

  )
  
    
    