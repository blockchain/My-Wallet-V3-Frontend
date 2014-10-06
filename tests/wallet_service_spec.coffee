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
      
      spyOn(Wallet,"monitor").and.callThrough()
      spyOn(Wallet,"monitorLegacy").and.callThrough()
      
      
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
    
    
    it "should get a list of accounts", inject((Wallet, MyWallet) ->
      expect(Wallet.accounts.length).toEqual(2)
      expect(Wallet.accounts[0].balance).toBeGreaterThan(0)

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
    
  describe "generateaccount()", ->      
    it "should call generateNewKey()", inject((Wallet, MyWallet) ->
      spyOn(MyWallet,"generateAccount")
      
      Wallet.generateAccount()
      
      expect(MyWallet.generateAccount).toHaveBeenCalled()
      
      return
    )
    
    it "should increase the number of accounts", inject((Wallet, MyWallet) ->
      before = Wallet.accounts.length
      
      Wallet.generateAccount()
      
      expect(Wallet.accounts.length).toBe(before + 1)
      
      return
    )
    
    return
    
  describe "addressBook()", ->      
    it "should find John", inject((Wallet) ->      
      expect(Wallet.addressBook["17gJCBiPBwY5x43DZMH3UJ7btHZs6oPAGq"]).toBe("John")
      return
    )
    
    return
    
  describe "send()", ->   
    beforeEach ->
      mockObserver = {} # Represents e.g. the controller calling us:
      mockObserver.transactionDidFailWithError = () ->
        return
      mockObserver.transactionDidFinish = () ->
        return
              
      return
     
    it "should call quickSendNoUI()", inject((Wallet, MyWallet) ->
      spyOn(MyWallet,"quickSendNoUI")
            
      Wallet.send("account", 1.0, mockObserver)
      
      expect(MyWallet.quickSendNoUI).toHaveBeenCalled()
      
      return
    )
    
    it "should call transactionDidFinish on the listerner if all goes well", inject((Wallet, MyWallet) ->         
      spyOn(mockObserver, "transactionDidFinish")
      
      Wallet.send("account", 1.0, mockObserver)
      
      expect(mockObserver.transactionDidFinish).toHaveBeenCalled()
      
      return
    )
    
    it "should call transactionDidFailWithError on the listerner if there's problem", inject((Wallet, MyWallet) ->
      MyWallet.mockShouldFailToSend()
         
      spyOn(mockObserver, "transactionDidFailWithError")
      
      Wallet.send("account", 1.0, mockObserver)
      
      expect(mockObserver.transactionDidFailWithError).toHaveBeenCalled()
      
      return
    )
    
    it "should spend money", inject((Wallet, MyWallet) ->
      
      before = Wallet.accounts[0].balance
            
      Wallet.send("account", 1.0, mockObserver)
      
      Wallet.refresh()
      
      after = Wallet.accounts[0].balance
      
      expect(before - after).toEqual(1.0)
      
      return
    )
    
    return

  describe "transactions", ->        
    it "should listen for on_tx and on_block", inject((Wallet, MyWallet) ->
            
      MyWallet.mockShouldReceiveNewTransaction()
            
      expect(Wallet.monitorLegacy).toHaveBeenCalled()
      
      MyWallet.mockShouldReceiveNewBlock()
      
      expect(Wallet.monitorLegacy).toHaveBeenCalled()
      
      return
    )
    
    it "should obtain the new transaction", inject((Wallet, MyWallet) ->
      before = Wallet.transactions.length
      
      MyWallet.mockShouldReceiveNewTransaction()
      
      expect(Wallet.transactions.length).toBe(before + 1)
      
      return
    )
  
    it "should receive a new transaction from mock after 5 seconds",  inject((MyWallet, Wallet, $timeout) ->
      before = Wallet.transactions.length
      MyWallet.mockSpontanuousBehavior()
      $timeout.flush()
      expect(Wallet.transactions.length).toBe(before + 1)
    )
    
    it "should beep on new transaction",  inject((MyWallet, Wallet, $timeout, ngAudio) ->
      spyOn(ngAudio, "load").and.callThrough()
      MyWallet.mockShouldReceiveNewTransaction()
      expect(ngAudio.load).toHaveBeenCalled()
    )
    
    it "should update the account balance upon a new transaction", inject((MyWallet, Wallet) ->
      before = Wallet.accounts[1].balance
      MyWallet.mockShouldReceiveNewTransaction()
      expect(Wallet.accounts[1].balance).toBeGreaterThan(before)
      
    )