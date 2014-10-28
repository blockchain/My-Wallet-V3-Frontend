describe "SettingsCtrl", ->
  scope = undefined
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      
      Wallet.login("test", "test")  
      
      scope = $rootScope.$new()
            
      $controller "SettingsCtrl",
        $scope: scope,
        $stateParams: {}
      
      return

    return
    
  it "should redirect to dashboard if not logged in",  inject((Wallet, $state) ->
    Wallet.logout()
    expect(scope.status.isLoggedIn).toBe(false)
    
    spyOn($state, "go")    
    scope.didLoad()
      
    expect($state.go).toHaveBeenCalledWith("dashboard")
  )
  
  it "should not redirect to dashboard if logged in",  inject((Wallet, $state) ->
    expect(scope.status.isLoggedIn).toBe(true)
    
    spyOn($state, "go")    
    scope.didLoad()
    
    expect($state.go).not.toHaveBeenCalled()

  )

    
    