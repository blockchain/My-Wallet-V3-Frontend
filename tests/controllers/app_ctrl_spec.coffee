describe "AppCtrl", ->
  scope = undefined
  
  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
    
      scope = $rootScope.$new()
        
      $controller "AppCtrl",
        $scope: scope,
        $stateParams: {}
  
      return

    return
    
  it "should redirect to login if not logged in",  inject((Wallet, $state) ->
    expect(scope.status.isLoggedIn).toBe(false)
    
    spyOn($state, "go")    
    
    scope.$broadcast("$stateChangeSuccess", {name: "dashboard"})
              
    expect($state.go).toHaveBeenCalledWith("login")
  )
  
  it "should not redirect to login if logged in",  inject((Wallet, $state) ->
    Wallet.login("test", "test")  
    expect(scope.status.isLoggedIn).toBe(true)
    
    spyOn($state, "go")    
    
    scope.$broadcast("$stateChangeSuccess", {name: "dashboard"})
    
    expect($state.go).not.toHaveBeenCalled()

  )
  