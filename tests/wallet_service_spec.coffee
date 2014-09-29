describe "walletServices", () ->
  Wallet = undefined
  MyWallet = undefined
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, $timeout) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      
      spyOn(MyWallet,"setGUID")
      spyOn(MyWallet,"restoreWallet")
    
      Wallet.login("uid", "pwd")  
      $timeout.flush()
      $timeout.flush()
      
      return

    return
    
  describe "login()", ->
    it "should fetch and decrypt the wallet", inject((Wallet, MyWallet) ->
      expect(MyWallet.setGUID).toHaveBeenCalledWith("uid")
      expect(MyWallet.restoreWallet).toHaveBeenCalledWith("pwd")
      
      return
    )
    
    it "should update the status", inject((Wallet, MyWallet) ->
      expect(Wallet.status.isLoggedIn).toBe(true)
      return
    )
    
    it "should get the language", inject((Wallet, MyWallet) ->
      expect(Wallet.settings.language).toEqual "en"
      return
    )
    
    it "should get the currency", inject((Wallet, MyWallet) ->
      expect(Wallet.settings.currency.code).toEqual "USD"
      return
    )
    
    return

  describe "logout()", ->      
    it "should update the status", inject((Wallet, MyWallet) ->
      expect(Wallet.status.isLoggedIn).toBe(true)
      
      Wallet.logout()
      expect(Wallet.status.isLoggedIn).toBe(false)
      
      return
    )
    
    return
    
  describe "generateAddress()", ->      
    it "should call generateNewKey()", inject((Wallet, MyWallet) ->
      spyOn(MyWallet,"generateNewKey")
      
      Wallet.generateAddress()
      
      expect(MyWallet.generateNewKey).toHaveBeenCalled()
      
      return
    )
    
    it "should increase the number of addresses", inject((Wallet, MyWallet) ->
      Wallet.generateAddress()
      
      expect(Wallet.addresses.length).toBe(1)
      
      return
    )
    
    return