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
                      
      return

    return
    
  describe "createAccount()", ->      
    beforeEach ->
      Wallet.login("test", "test")  
      
    it "should call generateNewKey()", inject((Wallet, MyWallet) ->      
      spyOn(MyWallet,"createAccount")
      
      Wallet.createAccount()
      
      expect(MyWallet.createAccount).toHaveBeenCalled()
      
      return
    )
    
    it "should increase the number of accounts", inject((Wallet, MyWallet) ->
      before = Wallet.accounts.length
      
      Wallet.createAccount()
      
      expect(Wallet.accounts.length).toBe(before + 1)
      
      return
    )
    
    it "should set a name", inject((Wallet, MyWallet) ->
       Wallet.createAccount("Savings")
       expect(Wallet.accounts[Wallet.accounts.length - 1].label).toBe("Savings")
    )
    
    return