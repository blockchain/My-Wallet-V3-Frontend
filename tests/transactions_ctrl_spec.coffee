describe "TransactionsCtrl", ->
  scope = undefined
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      
      Wallet.login("test", "test")  
      
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
  

  it "should receive a new transaction from mock after 3 seconds on account 1",  inject((MyWallet, Wallet, $timeout) ->
    pending() # Not sure how to test this with stateParams
    # before = Wallet.transactions.length
    #
    # MyWallet.mockSpontanuousBehavior()
    # $timeout.flush()
    # expect(Wallet.transactions.length).toBe(before + 1)
  )

    
    