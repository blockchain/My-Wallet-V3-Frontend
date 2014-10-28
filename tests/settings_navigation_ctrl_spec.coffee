describe "SettingsNavigationCtrl", ->
  scope = undefined
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      
      Wallet.login("test", "test")  
      
      scope = $rootScope.$new()
            
      $controller "SettingsNavigationCtrl",
        $scope: scope,
        $stateParams: {},
        
      scope.$digest()
      
      return

    return
    
  it "specs should be logged in by default",  inject((Wallet, $state) ->
    expect(scope.status.isLoggedIn).toBe(true)    
  
    return
  )
    
  it "should logout",  inject((Wallet, $stateParams, $state) ->
    spyOn(Wallet, "logout").and.callThrough()
    spyOn($state, "go")    
    
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