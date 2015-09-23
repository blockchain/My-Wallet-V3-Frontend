describe "walletServices", () ->
  mockObserver = undefined  
  errors = undefined
  Wallet = undefined
  
  
  
  beforeEach ->
    angular.mock.inject ($injector, localStorageService) ->
      localStorageService.remove("mockWallets")
      
      Wallet = $injector.get("Wallet")

      Wallet.accounts = () -> [{index: 0}]
                      
      spyOn(Wallet,"monitor").and.callThrough()
      
      mockObserver = {needs2FA: (() ->)}
            
      return

    return

  describe "redeemFromEmailOrMobile",  ->
    beforeEach ->
      Wallet.my.redeemFromEmailOrMobile = () ->
    
    it "should add funds to the correct account", ->
      spyOn(Wallet.my, "redeemFromEmailOrMobile")

      Wallet.redeemFromEmailOrMobile(Wallet.accounts()[0], "abcd", (()->), (()->))
      
      expect(Wallet.my.redeemFromEmailOrMobile.calls.argsFor(0)[0]).toBe(0)
