describe "walletServices", () ->
  Wallet = undefined
  MyWallet = undefined
  mockObserver = undefined  
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, localStorageService) ->
      localStorageService.remove("mockWallets")
      
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      
            
      spyOn(MyWallet,"setGUID").and.callThrough()
      spyOn(MyWallet,"restoreWallet").and.callThrough()
    
      Wallet.login("test", "test")  
      
      spyOn(Wallet,"monitor").and.callThrough()
      spyOn(Wallet,"monitorLegacy").and.callThrough()
      
      return

    return
    
  describe "login()", ->
    it "should fetch and decrypt the wallet", inject((Wallet, MyWallet) ->
      expect(MyWallet.setGUID).toHaveBeenCalledWith("test")
      expect(MyWallet.restoreWallet).toHaveBeenCalledWith("test")
      
      return
    )
    
    it "should update the status", inject((Wallet, MyWallet) ->
      expect(Wallet.status.isLoggedIn).toBe(true)
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
    
  describe "createAccount()", ->      
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
     
    it "should call sendBitcoinsForAccount()", inject((Wallet, MyWallet) ->
      spyOn(MyWallet,"sendBitcoinsForAccount")
            
      Wallet.send(0, "account", numeral("1.0"), "BTC", mockObserver)
      
      expect(MyWallet.sendBitcoinsForAccount).toHaveBeenCalled()
      
      return
    )
    
    it "should convert BTC to Satoshi", inject((Wallet, MyWallet) ->
      spyOn(MyWallet,"sendBitcoinsForAccount")
            
      Wallet.send(0, "account", numeral("1.0"), "BTC", mockObserver)
      
      expect(MyWallet.sendBitcoinsForAccount.calls.mostRecent().args[2]).toBe(100000000)
      
      return
    )
    
    it "should call transactionDidFinish on the listerner if all goes well", inject((Wallet, MyWallet) ->         
      spyOn(mockObserver, "transactionDidFinish")
      
      Wallet.send(0, "account", numeral("1.0"), "BTC", mockObserver)
      
      expect(mockObserver.transactionDidFinish).toHaveBeenCalled()
      
      return
    )
    
    it "should update the account balance if successful", inject((Wallet, MyWallet) ->               
      before = Wallet.accounts[0].balance
      
      Wallet.send(0, "account", numeral("1.0"), "BTC", mockObserver)
      
      expect(Wallet.accounts[0].balance.value()).toBe(before - 1.0 * 100000000)
        
      return
    )
    
    it "should update transactions if successful", inject((Wallet, MyWallet) ->               
      before = Wallet.transactions.length
      
      Wallet.send(0, "account", numeral("1.0"), "BTC", mockObserver)
      
      expect(Wallet.transactions.length).toBe(before + 1)
        
      return
    )
    
    it "should call transactionDidFailWithError on the listerner if there's problem", inject((Wallet, MyWallet) ->
      MyWallet.mockShouldFailToSend()
         
      spyOn(mockObserver, "transactionDidFailWithError")
      
      Wallet.send(0, "account", numeral("1.0"), "BTC", mockObserver)
      
      expect(mockObserver.transactionDidFailWithError).toHaveBeenCalled()
      
      return
    )
    
    it "should spend money", inject((Wallet, MyWallet) ->
      
      before = Wallet.accounts[0].balance
            
      Wallet.send(0, "account", numeral("1.0"), "BTC", mockObserver)
      
      Wallet.refresh()
      
      after = Wallet.accounts[0].balance
      
      expect(before - after).toEqual(100000000)
      
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
    
  describe "request", ->
    it "can be made", inject((MyWallet, Wallet) ->
      expect(Wallet.generatePaymentRequestForAccount(0, numeral(1)).address).toBe("1Q57Pa6UQiDBeA3o5sQR1orCqfZzGA7Ddp")
    )
    
    it "is stored", inject((MyWallet, Wallet) ->
      request = Wallet.generatePaymentRequestForAccount(0, numeral(1))
      
      Wallet.refreshPaymentRequests() # TODO: this should happen automatically
      
      expect(Wallet.paymentRequests.length).toBeGreaterThan(0)
    )
    
    it "amount can be updated", inject((MyWallet, Wallet) ->
      request = Wallet.generatePaymentRequestForAccount(0, numeral(1000))
      Wallet.updatePaymentRequest(0, request.address, numeral(2000))
      expect(parseInt(Wallet.paymentRequests[0].amount.format("1"))).toBe(2000)
    )
        

    it "should be possible to cancel a request", inject((MyWallet, Wallet) ->
      request = Wallet.generatePaymentRequestForAccount(0, numeral(1))
      Wallet.cancelPaymentRequest(0, request.address)
      
      Wallet.refreshPaymentRequests()
      
      expect(Wallet.paymentRequests.length).toBe(0)
    )
    
    it "should update the request when payment is received", inject((MyWallet, Wallet) ->
      request = Wallet.generatePaymentRequestForAccount(0, numeral(100000000))
            
      MyWallet.mockShouldReceiveNewTransaction(request.address, "1Q9abeFt9drSYS1XjwMjR51uFH2csh86iC" ,  parseInt(request.amount.format("1")) , "")
            
      request = Wallet.paymentRequests[0]
            
      expect(request.paid.format("1")).toBe(request.amount.format("1"))
    )
    
  
    it "should notify the user if payment is received", inject((Wallet) ->
      request = Wallet.generatePaymentRequestForAccount(0, numeral(100000000))
      MyWallet.mockShouldReceiveNewTransaction(request.address, "1Q9abeFt9drSYS1XjwMjR51uFH2csh86iC" , parseInt(request.amount.format("1")), "")
      
      request = Wallet.paymentRequests[0]
   
      expect(Wallet.alerts.length).toBe(1)
    
    )
    
  
    it "should warn user if payment is insufficient", inject(() ->
      
      request = Wallet.generatePaymentRequestForAccount(0, numeral(100000000))
      MyWallet.mockShouldReceiveNewTransaction(request.address, "1Q9abeFt9drSYS1XjwMjR51uFH2csh86iC" , parseInt(request.amount.format("1")) / 2, "")
      
      expect(Wallet.alerts.length).toBe(1)
      expect(Wallet.alerts[0].type).not.toBeDefined()
      expect(request.complete).not.toBe(true)
    )
  
    it "should warn user if payment is too much", inject(() ->
      request = Wallet.generatePaymentRequestForAccount(0, numeral(100000000))
      
      spyOn(Wallet, "displayWarning")
      
      MyWallet.mockShouldReceiveNewTransaction(request.address, "1Q9abeFt9drSYS1XjwMjR51uFH2csh86iC" ,  parseInt(request.amount.format("1"))  * 2, "")
      
      expect(Wallet.displayWarning).toHaveBeenCalled()
      
      expect(request.complete).not.toBe(true)
    
    )
    
    return
  
  describe "parsePaymentRequest()", ->
    it "should recognise bitcoin://", inject((Wallet) ->
      result = Wallet.parsePaymentRequest("http://")
      expect(result.hasBitcoinPrefix).toBeFalse
      
      result = Wallet.parsePaymentRequest("bitcoin://")
      expect(result.hasBitcoinPrefix).toBeTrue
    )
    
    it "should recognise a valid request", inject((Wallet) ->
      result = Wallet.parsePaymentRequest("bitcoin://abcdefg?amount=10")
      expect(result.isValid).toBeTrue
    )
    
    it "should extract the address", inject((Wallet) ->
      result = Wallet.parsePaymentRequest("bitcoin://abcdefg?amount=0.1")
      expect(result.address).toBe "abcdefg"
    )
    
    it "should recognise bitcoin:address", inject((Wallet) ->
      result = Wallet.parsePaymentRequest("bitcoin:abc")
      expect(result.hasBitcoinPrefix).toBeTrue
      expect(result.address).toBe "abc"
    )
    
    it "should extract the address if no amount param is present", inject((Wallet) ->
      result = Wallet.parsePaymentRequest("bitcoin://abcdefg")
      expect(result.address).toBe "abcdefg"
    )
    
    it "should extract the amount", inject((Wallet) ->
      result = Wallet.parsePaymentRequest("bitcoin://abcdefg?amount=0.1")
      expect(result.amount).toBe "0.1"
    )
     
    it "should ignore additional parameters", inject((Wallet) ->
      result = Wallet.parsePaymentRequest("bitcoin://abcdefg?amount=0.1&other=hello")
      expect(result.amount).toBe "0.1"
      expect(result.address).toBe "abcdefg"
    )
    
    it "should ignore the order of parameters", inject((Wallet) ->
      result = Wallet.parsePaymentRequest("bitcoin://abcdefg?other=hello&amount=0.1")
      expect(result.amount).toBe "0.1"
      expect(result.address).toBe "abcdefg"
    )
     
     
    return
    
  describe "isSyncrhonizedWithServer()", ->      
    it "should be in sync after first load", inject((Wallet) ->      
      expect(Wallet.isSynchronizedWithServer()).toBe(true)
      return
    )
    
    it "should not be in sync while new account is saved", inject((Wallet, $timeout) ->     
      Wallet.createAccount()
      expect(Wallet.isSynchronizedWithServer()).toBe(false)
      $timeout.flush()
      
      expect(Wallet.isSynchronizedWithServer()).toBe(true)
      return
    )
    
    return
    
  describe "alerts()", ->
    it "should should remove alert after some time", inject((Wallet, $timeout) ->   
      Wallet.displaySuccess("Victory")
      expect(Wallet.alerts.length).toBe(1)
      $timeout.flush()
      expect(Wallet.alerts.length).toBe(0)
      
    
    )
    return
    
    
  describe "language", ->
    it "should be set after loading", inject((Wallet) ->
      expect(Wallet.settings.language).toEqual({code: "en", name: "English"})
    )
      
    it "should switch language", inject((Wallet, MyWallet) ->
      spyOn(MyWallet, "change_language").and.callThrough()
      Wallet.changeLanguage(Wallet.languages[0])
      expect(MyWallet.change_language).toHaveBeenCalledWith("de")
      expect(MyWallet.getLanguage()).toBe("de")
      expect(Wallet.settings.language.code).toBe("de")
      
    )
    
    return
    
  describe "email", ->
    it "should be set after loading", inject((Wallet) ->
      expect(Wallet.user.email).toEqual("steve@me.com")
    )
      
    it "should allow changing email", inject((Wallet, MyWallet) ->
      spyOn(MyWallet, "changeEmail").and.callThrough()
      Wallet.changeEmail("other@me.com")
      expect(MyWallet.changeEmail).toHaveBeenCalledWith("other@me.com")
      expect(MyWallet.getEmail()).toBe("other@me.com")
      expect(Wallet.user.email).toBe("other@me.com")
      expect(Wallet.isEmailVerified()).toBe(false)
    )
    
    return
    
  describe "mobile", ->
    it "should be set after loading", inject((Wallet) ->
      expect(Wallet.user.mobile).toEqual("+3112345678")
    )
      
    it "should allow change", inject((Wallet, MyWallet) ->
      spyOn(MyWallet, "changeMobile").and.callThrough()
      Wallet.changeMobile("+3100000000")
      expect(MyWallet.changeMobile).toHaveBeenCalledWith("+3100000000")
      expect(MyWallet.getMobile()).toBe("+3100000000")
      expect(Wallet.user.mobile).toBe("+3100000000")
      expect(Wallet.isMobileVerified()).toBe(false)
    )
    
    return
  