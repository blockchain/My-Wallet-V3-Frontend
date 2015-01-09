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
    
  describe "send()", ->   
    beforeEach ->
      Wallet.login("test", "test")  
      
      mockObserver = {
        success: () ->
          return
        error: () ->
          return
      }
              
      return
     
    it "should call sendBitcoinsForAccount()", inject((Wallet, MyWallet) ->
      spyOn(MyWallet,"sendBitcoinsForAccount")
            
      Wallet.send(Wallet.accounts[0], "destination_address", numeral("1.0"), "BTC", mockObserver.success, mockObserver.error)
      
      expect(MyWallet.sendBitcoinsForAccount).toHaveBeenCalled()
      
      return
    )
    
    it "should convert BTC to Satoshi", inject((Wallet, MyWallet) ->
      spyOn(MyWallet,"sendBitcoinsForAccount")
            
      Wallet.send(Wallet.accounts[0], "destination_address", "1", "BTC", mockObserver.success, mockObserver.error)
      
      expect(MyWallet.sendBitcoinsForAccount.calls.mostRecent().args[2]).toBe(100000000)
      
      return
    )
    
    it "should call success callback if all goes well", inject((Wallet, MyWallet) ->         
      spyOn(mockObserver, "success")
      
      Wallet.send(Wallet.accounts[0], "destination_address", numeral("1.0"), "BTC", mockObserver.success, mockObserver.error)
      
      expect(mockObserver.success).toHaveBeenCalled()
      
      return
    )
    
    it "should update the account balance if successful", inject((Wallet, MyWallet) ->               
      before = Wallet.accounts[0].balance
      
      Wallet.send(Wallet.accounts[0], "destination_address", numeral("1.0"), "BTC", mockObserver.success, mockObserver.error)
      
      expect(Wallet.accounts[0].balance).toBe(before - 1.0 * 100000000)
        
      return
    )
    
    it "should update transactions if successful", inject((Wallet, MyWallet) ->               
      before = Wallet.transactions.length
      
      Wallet.send(Wallet.accounts[0], "destination_address", numeral("1.0"), "BTC", mockObserver.success, mockObserver.error)
      
      expect(Wallet.transactions.length).toBe(before + 1)
        
      return
    )
    
    it "should call error callback if there's problem", inject((Wallet, MyWallet) ->
      MyWallet.mockShouldFailToSend()
         
      spyOn(mockObserver, "error")
      
      Wallet.send(Wallet.accounts[0], "destination_address", numeral("1.0"), "BTC", mockObserver.success, mockObserver.error)
      
      expect(mockObserver.error).toHaveBeenCalled()
      
      return
    )
    
    it "should spend money", inject((Wallet, MyWallet) ->
      
      before = Wallet.accounts[0].balance
            
      Wallet.send(Wallet.accounts[0], "destination_address", numeral("1.0"), "BTC", mockObserver.success, mockObserver.error)
      
      Wallet.refresh()
      
      after = Wallet.accounts[0].balance
      
      expect(before - after).toEqual(100000000)
      
      return
    )
    
    return