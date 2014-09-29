describe "DashboardCtrl", ->
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
            
      $controller "DashboardCtrl",
        $scope: scope,
        $stateParams: {}
      
      return

    return
    
  it "specs should be logged in by default",  inject((Wallet, $state, $timeout) ->
    expect(scope.status.isLoggedIn).toBe(true)    
  
    return
  )
    
  it "should logout",  inject((Wallet, $state, $timeout) ->
    spyOn(Wallet, "logout").and.callThrough()
    
    scope.logout()
    
    expect(Wallet.logout).toHaveBeenCalled()
    
    expect(scope.status.isLoggedIn).toBe(false)    
    
    return
  )  
    
  it "should login",  inject((Wallet, $state, $timeout) ->
    # Logout and reload controller first
    Wallet.logout()

    scope.uid = "user"
    scope.password = "pass"
    
    spyOn(Wallet, "login")
    
    scope.login()
    
    expect(Wallet.login).toHaveBeenCalledWith("user", "pass")
    return
  )
  
    
    