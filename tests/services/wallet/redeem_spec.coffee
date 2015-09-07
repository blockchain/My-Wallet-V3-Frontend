describe "walletServices", () ->
  mockObserver = undefined  
  errors = undefined
  Wallet = undefined
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, localStorageService) ->
      localStorageService.remove("mockWallets")
      
      Wallet = $injector.get("Wallet")

      Wallet.accounts = () -> [{index: 0}]

      Wallet.spender = () ->
        fromPrivateKey: () ->

      spyOn(Wallet,"monitor").and.callThrough()
      
      mockObserver = {needs2FA: (() ->)}
            
      return

    return

  describe "redeemFromEmailOrMobile",  ->
    beforeEach ->
      spyOn(Wallet, "spender")

    it "should create a spender object", ->
      pending()

      Wallet.redeemFromEmailOrMobile(Wallet.accounts()[1], "abcd", (()->), (()->))
      expect(Wallet.spender).toHaveBeenCalled()


    it "should pass the desired index to the spender", ->
      pending()
      #   Wallet.redeemFromEmailOrMobile(Wallet.accounts()[1], "abcd", (()->), (()->))
