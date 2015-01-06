describe "ClaimModalCtrl", ->
  scope = undefined
  modalInstance =
    close: ->
    dismiss: ->
        
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, localStorageService, $rootScope, $controller) ->
      localStorageService.remove("mockWallets")
      
      Wallet = $injector.get("Wallet")      
            
      MyWallet = $injector.get("MyWallet")
      
      Wallet.login("test", "test")  
      
      scope = $rootScope.$new()
      
      balancePromise = {
        then: (r)->
          r(100000)
      }
      
      $controller "ClaimModalCtrl",
        $scope: scope,
        $stateParams: {},
        $modalInstance: modalInstance
        claim: {code: "abcd", balance: balancePromise}
        
      scope.$digest()
    
      return

    return
    
  it "should list accounts", ->
    expect(scope.accounts.length).toBeGreaterThan(0)
    
  it "should fetch the redeem balance", ->
    expect(scope.balance).toBe(100000)
    
  it "should let the user redeem", inject((Wallet)->
    spyOn(Wallet, "redeemFromEmailOrMobile")
    scope.redeem()
    expect(Wallet.redeemFromEmailOrMobile).toHaveBeenCalled()
    expect(Wallet.redeemFromEmailOrMobile.calls.argsFor(0)[0]).toEqual(scope.accounts[0])
    expect(Wallet.redeemFromEmailOrMobile.calls.argsFor(0)[1]).toEqual("abcd")
  
  )