describe "NavigationCtrl", ->
  scope = undefined
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      
      Wallet.login("test", "test")  
      
      scope = $rootScope.$new()
            
      $controller "NavigationCtrl",
        $scope: scope,
        $stateParams: {}
      
      return

    return

  it "is in transaction state", ->
    expect(scope.isTransactionState()).toBe(false)

  it "is in security state", ->
    expect(scope.isSecurityState()).toBe(false)

  it "should have access to login status",  inject(() ->
    expect(scope.status.isLoggedIn).toBe(true)
  )
  
  it "should logout",  inject((Wallet, $stateParams, $state) ->
    spyOn(Wallet, "logout").and.callThrough()
    spyOn($state, "go")  
    
    spyOn(window, 'confirm').and.callFake(() ->
         return true
    )
    
    scope.logout()
    
    expect(Wallet.logout).toHaveBeenCalled()
    
    expect(scope.status.isLoggedIn).toBe(false)    
    
    return
  )  
  
  it "should not logout if save is in progress",  inject((Wallet, MyWallet, $stateParams) ->
    spyOn(Wallet, "logout").and.callThrough()
    
    MyWallet.sync()
    
    scope.logout()
    
    expect(Wallet.logout).not.toHaveBeenCalled()
    
    expect(scope.status.isLoggedIn).toBe(true)    
    
    return
  )