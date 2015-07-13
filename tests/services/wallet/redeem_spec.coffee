describe "walletServices", () ->
  Wallet = undefined
  MyWallet = undefined
  mockObserver = undefined  
  errors = undefined
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, localStorageService) ->
      localStorageService.remove("mockWallets")
      
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
            
      spyOn(MyWallet,"login").and.callThrough()
          
      spyOn(Wallet,"monitor").and.callThrough()
      
      mockObserver = {needs2FA: (() ->)}
            
      return

    return

  describe "redeemFromEmailOrMobile",  ->
    it "should add funds to the correct account", ->
      Wallet.redeemFromEmailOrMobile(Wallet.accounts[0], "abcd", (()->), (()->))