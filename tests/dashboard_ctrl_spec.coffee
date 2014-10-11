describe "DashboardCtrl", ->
  scope = undefined
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, $timeout, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      
      Wallet.login("test", "test")  
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
  
  it "should create a new wallet",  inject((Wallet, $state, $timeout) ->
    spyOn(Wallet, "create")
    
    scope.uid = "user"
    scope.password = "pass"
    
    scope.create()
    
    expect(Wallet.create).toHaveBeenCalledWith("user", "pass")
    
  )
  
    
    