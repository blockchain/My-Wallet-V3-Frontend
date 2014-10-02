describe "walletServices", () ->
  Wallet = undefined
  MyWallet = undefined
  mockObserver = undefined
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, $timeout) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      
      spyOn(MyWallet,"setGUID")
      spyOn(MyWallet,"restoreWallet").and.callThrough()
    
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
    
    
    it "should get a list of addresses", inject((Wallet, MyWallet) ->
      expect(Wallet.addresses.length).toEqual(1)
      expect(Wallet.addresses[0].balance).toEqual(2.0)

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
      before = Wallet.addresses.length
      
      Wallet.generateAddress()
      
      expect(Wallet.addresses.length).toBe(before + 1)
      
      return
    )
    
    return
    
  describe "send()", ->   
    beforeEach ->
      mockObserver = {} # Represents e.g. the controller calling us:
      mockObserver.transactionDidFailWithError = () ->
        return
              
      return
     
    it "should call quickSendNoUI()", inject((Wallet, MyWallet) ->
      spyOn(MyWallet,"quickSendNoUI")
            
      Wallet.send("address", 1.0, mockObserver)
      
      expect(MyWallet.quickSendNoUI).toHaveBeenCalled()
      
      return
    )
    
    it "should call transactionDidFailWithError on the listerner if there's problem", inject((Wallet, MyWallet) ->
      MyWallet.mockShouldFailToSend()
         
      spyOn(mockObserver, "transactionDidFailWithError")
      
      Wallet.send("address", 1.0, mockObserver)
      
      expect(mockObserver.transactionDidFailWithError).toHaveBeenCalled()
      
      return
    )
    
    it "should spend money", inject((Wallet, MyWallet) ->
      
      before = Wallet.addresses[0].balance
            
      Wallet.send("address", 1.0, mockObserver)
      
      Wallet.refresh()
      
      after = Wallet.addresses[0].balance
      
      expect(before - after).toEqual(1.0)
      
      return
    )
    
    return