describe "TransactionsCtrl", ->
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
            
      $controller "TransactionsCtrl",
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
  
  it "should not redirect to dashboard if not logged in",  inject((Wallet, $state) ->
    expect(scope.status.isLoggedIn).toBe(true)
    
    spyOn($state, "go")    
    scope.didLoad()
    
    expect($state.go).not.toHaveBeenCalled()

  )
  
  it "should have access to address book",  inject(() ->
    expect(scope.addressBook).toBeDefined()
    expect(scope.addressBook["17gJCBiPBwY5x43DZMH3UJ7btHZs6oPAGq"]).toBe("John")
    
  )

    
    