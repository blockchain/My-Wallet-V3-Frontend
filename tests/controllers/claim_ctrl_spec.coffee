describe "ClaimCtrl", ->
  scope = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
   angular.mock.inject ($injector, $rootScope, $controller, $state) ->
     Wallet = $injector.get("Wallet")
     MyWallet = $injector.get("MyWallet")    
  
     scope = $rootScope.$new()
     
     spyOn($state, "go")
        
     $controller "ClaimCtrl",
       $scope: scope,
       $stateParams: {code: "abcd"}
  
     return

   return
   
  it "should redirect to login",  inject(($state) ->
    expect($state.go).toHaveBeenCalledWith("login")
  )
  
  it "should store the goal", inject((Wallet) ->
    expect(Wallet.goal.claim).toBeDefined()
    expect(Wallet.goal.claim.code).toBe("abcd")
  )