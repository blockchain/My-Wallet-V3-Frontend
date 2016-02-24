describe "ClaimCtrl", ->
  scope = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
   angular.mock.inject ($injector, $rootScope, $controller, $state, $q) ->
     Wallet = $injector.get("Wallet")
     MyBlockchainApi = $injector.get("MyBlockchainApi")

     MyBlockchainApi.getBalanceForRedeemCode = (code) -> $q.resolve(10000)

     scope = $rootScope.$new()

     spyOn($state, "go")

     $controller "ClaimCtrl",
       $scope: scope,
       $stateParams: {code: "abcd"}

     return

   return

  it "should redirect to login",  inject(($state) ->
    expect($state.go).toHaveBeenCalledWith("public.login-no-uid")
  )

  it "should store the goal", inject((Wallet) ->
    expect(Wallet.goal.claim).toBeDefined()
    expect(Wallet.goal.claim.code).toBe("abcd")
  )
