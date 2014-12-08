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
            
      spyOn(MyWallet,"fetchWalletJson").and.callThrough()
          
      spyOn(Wallet,"monitor").and.callThrough()
      spyOn(Wallet,"monitorLegacy").and.callThrough()
      
      return

    return
    
  describe "login()", ->
    beforeEach ->
      Wallet.login("test", "test")  
    
    it "should fetch and decrypt the wallet", inject((Wallet, MyWallet) ->
      expect(MyWallet.fetchWalletJson).toHaveBeenCalled()
      
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
    
    it "should get a list of legacy addresses", inject((Wallet, MyWallet) ->
      expect(Wallet.legacyAddresses.length).toEqual(5)

      return
    )
    
    it "should use address as label if no label is given", inject((Wallet, MyWallet) ->
      expect(Wallet.legacyAddresses[0].label).toEqual("Old")
      expect(Wallet.legacyAddresses[2].label).toEqual("some_legacy_address_without_label")

      return
    )
    
    it "should get a list of languages", inject((Wallet, MyWallet) ->
      expect(Wallet.languages.length).toBeGreaterThan(1)
    )
    
    it "should get a list of currencies", inject((Wallet, MyWallet) ->
      expect(Wallet.currencies.length).toBeGreaterThan(1)
    )
      

    
  describe "2FA login()", ->
    it "should ask for a code", inject((Wallet) ->
      
      Wallet.login("test-2FA", "test")
      
      expect(Wallet.settings.needs2FA).toBe(true)
      expect(Wallet.status.isLoggedIn).toBe(false)
    )
    
    it "should specify the 2FA method", inject((Wallet) ->
      Wallet.login("test-2FA", "test")
      expect(Wallet.settings.twoFactorMethod).toBe(4)
    )
    
    it "should login with  2FA code", inject((Wallet) ->
      Wallet.login("test-2FA", "test", "1234567")
      expect(Wallet.status.isLoggedIn).toBe(true)
    )

    
    return
    
  describe "2FA settings", ->    
    it "can be disabled", inject((Wallet) ->
      Wallet.login("test-2FA", "test")
      
      Wallet.disableSecondFactor()
      expect(Wallet.settings.needs2FA).toBe(false)
      expect(Wallet.settings.twoFactorMethod).toBe(null)
      
      
    )
  

  describe "logout()", ->     
    beforeEach ->
      Wallet.login("test", "test")  
      
    it "should update the status", inject((Wallet, MyWallet) ->
      expect(Wallet.status.isLoggedIn).toBe(true)
      
      Wallet.logout()
      expect(Wallet.status.isLoggedIn).toBe(false)
      
      return
    )
    
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
    
  describe "addressBook()", ->          
    beforeEach ->
      Wallet.login("test", "test")  
      
    it "should find John", inject((Wallet) ->      
      expect(Wallet.addressBook["17gJCBiPBwY5x43DZMH3UJ7btHZs6oPAGq"]).toBe("John")
      return
    )
    
    return
    
  describe "send()", ->   
    beforeEach ->
      Wallet.login("test", "test")  
      
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
            
      Wallet.send(0, "account", "1", "BTC", mockObserver)
      
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
      
      expect(Wallet.accounts[0].balance).toBe(before - 1.0 * 100000000)
        
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
    beforeEach ->
      Wallet.login("test", "test")  
       
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
    beforeEach ->
      Wallet.login("test", "test")  
      
    it "can be made", inject((MyWallet, Wallet) ->
      expect(Wallet.generatePaymentRequestForAccount(0, 10000).address).toBe("1Q57Pa6UQiDBeA3o5sQR1orCqfZzGA7Ddp")
    )
    
    it "is stored", inject((MyWallet, Wallet) ->
      request = Wallet.generatePaymentRequestForAccount(0, 10000)
      
      Wallet.refreshPaymentRequests() # TODO: this should happen automatically
      
      expect(Wallet.paymentRequests.length).toBeGreaterThan(0)
    )
    
    it "amount can be updated", inject((MyWallet, Wallet) ->
      request = Wallet.generatePaymentRequestForAccount(0, 1000)
      Wallet.updatePaymentRequest(0, request.address, 2000)
      expect(Wallet.paymentRequests[0].amount).toBe(2000)
    )
        

    it "should be possible to cancel a request", inject((MyWallet, Wallet) ->
      request = Wallet.generatePaymentRequestForAccount(0, 1000)
      Wallet.cancelPaymentRequest(0, request.address)
      
      Wallet.refreshPaymentRequests()
      
      expect(Wallet.paymentRequests.length).toBe(0)
    )
    
    it "should update the request when payment is received", inject((MyWallet, Wallet) ->
      request = Wallet.generatePaymentRequestForAccount(0, 100000000)
                        
      MyWallet.mockShouldReceiveNewTransaction(request.address, "1Q9abeFt9drSYS1XjwMjR51uFH2csh86iC" ,  request.amount, null)
            
      request = Wallet.paymentRequests[0]
            
      expect(request.paid).toBe(request.amount)
    )
    
  
    it "should notify the user if payment is received", inject((Wallet) ->
      request = Wallet.generatePaymentRequestForAccount(0, 100000000)
      MyWallet.mockShouldReceiveNewTransaction(request.address, "1Q9abeFt9drSYS1XjwMjR51uFH2csh86iC" , request.amount, "")
      
      request = Wallet.paymentRequests[0]
   
      expect(Wallet.alerts.length).toBe(1)
    
    )
    
  
    it "should warn user if payment is insufficient", inject(() ->
      
      request = Wallet.generatePaymentRequestForAccount(0, 100000000)
      MyWallet.mockShouldReceiveNewTransaction(request.address, "1Q9abeFt9drSYS1XjwMjR51uFH2csh86iC" , request.amount / 2, "")
      
      expect(Wallet.alerts.length).toBe(1)
      expect(Wallet.alerts[0].type).not.toBeDefined()
      expect(request.complete).not.toBe(true)
    )
  
    it "should warn user if payment is too much", inject(() ->
      request = Wallet.generatePaymentRequestForAccount(0, 100000000)
      
      spyOn(Wallet, "displayWarning")
      
      MyWallet.mockShouldReceiveNewTransaction(request.address, "1Q9abeFt9drSYS1XjwMjR51uFH2csh86iC" ,  request.amount * 2, "")
      
      expect(Wallet.displayWarning).toHaveBeenCalled()
      
      expect(request.complete).not.toBe(true)
    
    )
    
    return
  
  describe "parsePaymentRequest()", ->    
    beforeEach ->
      Wallet.login("test", "test")  
      
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
    beforeEach ->
      Wallet.login("test", "test")  
       
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
    beforeEach ->
      Wallet.login("test", "test")  
      
    it "should should remove alert after some time", inject((Wallet, $timeout) ->   
      Wallet.displaySuccess("Victory")
      expect(Wallet.alerts.length).toBe(1)
      $timeout.flush()
      expect(Wallet.alerts.length).toBe(0)
      
    
    )
    return
    
    
  describe "language", ->    
    beforeEach ->
      Wallet.login("test", "test")  
      
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
    
    
  describe "currency", ->    
    beforeEach ->
      Wallet.login("test", "test")  
      
    it "should be set after loading", inject((Wallet) ->
      expect(Wallet.settings.currency.code).toEqual("USD")
    )
    
    
    it "conversion should be set on load", inject((Wallet) ->
      expect(Wallet.conversions["USD"].conversion).toBeGreaterThan(0)
    )
      
    it "can be switced", inject((Wallet, MyWallet) ->
      spyOn(MyWallet, "change_local_currency").and.callThrough()
      Wallet.changeCurrency(Wallet.currencies[1])
      expect(MyWallet.change_local_currency).toHaveBeenCalledWith("EUR")
      expect(Wallet.settings.currency.code).toBe("EUR")
    )
    
    return
    
  describe "email", ->    
    beforeEach ->
      Wallet.login("test", "test")  
      
    it "should be set after loading", inject((Wallet) ->
      expect(Wallet.user.email).toEqual("steve@me.com")
    )
      
    it "can be changed", inject((Wallet, MyWallet) ->
      spyOn(MyWallet, "change_email").and.callThrough()
      Wallet.changeEmail("other@me.com")
      expect(MyWallet.change_email).toHaveBeenCalled()
      expect(Wallet.user.email).toBe("other@me.com")
      expect(Wallet.user.isEmailVerified).toBe(false)
    )
    
    return
    
  describe "mobile", ->    
    beforeEach ->
      Wallet.login("test", "test")  
      
    it "should be set after loading", inject((Wallet) ->
      expect(Wallet.user.mobile.number).toEqual("12345678")
    )
      
    it "should allow change", inject((Wallet, MyWallet) ->
      spyOn(MyWallet, "changeMobileNumber").and.callThrough()
      newNumber = {country: "+31", number: "0100000000"}
      Wallet.changeMobile(newNumber )
      expect(MyWallet.changeMobileNumber).toHaveBeenCalled()
      expect(Wallet.user.mobile).toBe(newNumber)
      expect(Wallet.user.isMobileVerified).toBe(false)
    )
    
    it "can be verified", inject((Wallet, MyWallet) ->
      spyOn(MyWallet, "verifyMobile").and.callThrough()

      Wallet.verifyMobile("12345")
      
      expect(MyWallet.verifyMobile).toHaveBeenCalled()
      
      expect(Wallet.user.isMobileVerified).toBe(true)
    
      return
    )
    
    return
  
  describe "password", ->    
    beforeEach ->
      Wallet.login("test", "test")  
      
    it "can be checked", inject((Wallet, MyWallet) ->
      expect(MyWallet.isCorrectMainPassword("test")).toBe(true)
    )
      
    it "can be changed", inject((Wallet, MyWallet) ->
      spyOn(MyWallet, "changePassword").and.callThrough()
      Wallet.changePassword("newpassword")
      expect(MyWallet.changePassword).toHaveBeenCalled()
      expect(MyWallet.isCorrectMainPassword("newpassword")).toBe(true)
    )
    
    return
    
  describe "password hint", ->    
    beforeEach ->
      Wallet.login("test", "test")  
      
    it "should be set after loading", inject((Wallet) ->
      expect(Wallet.user.passwordHint).toEqual("Same as username")
    )
    
    it "should be an empty string if not set", inject((Wallet) ->
      pending()
      expect(Wallet.user.passwordHint).toEqual("")
    )
    

    it "can be changed", inject((Wallet, MyWallet) ->
      spyOn(MyWallet, "update_password_hint1").and.callThrough()
      Wallet.changePasswordHint("Better hint")
      expect(MyWallet.update_password_hint1).toHaveBeenCalled()
      expect(Wallet.user.passwordHint).toBe("Better hint")
    )
    
    return
    
  describe "currency conversion", ->    
    beforeEach ->
      Wallet.login("test", "test")  
      
    it "should know the exchange rate in satoshi per unit of fiat", inject((Wallet) ->
      expect(Wallet.conversions.EUR.conversion).toBe(333333)
    )
  
    it "should calculate BTC from fiat amount and currency", inject((Wallet) ->
      expect(Wallet.fiatToSatoshi("2", "EUR")).toBe(666666)
    )
    
    it "should calculate fiat from BTC", inject((Wallet) ->
      expect(Wallet.BTCtoFiat("0.1", "EUR")).toBe("30.00")
    )
    
    return
    
  describe "total()", ->     
    beforeEach ->
      Wallet.login("test", "test")  
      
    it "should return the balance for each account", inject((Wallet, MyWallet) ->
      expect(Wallet.total(0)).toBeGreaterThan(0)
      expect(Wallet.total(0)).toBe(MyWallet.getBalanceForAccount(0))
      expect(Wallet.total(1)).toBe(MyWallet.getBalanceForAccount(1))
      
      return
    )
    
    it "should return the sum of all accounts", inject((Wallet, MyWallet) ->
      expect(Wallet.total("")).toBeGreaterThan(0)
      expect(Wallet.total("")).toBe(MyWallet.getBalanceForAccount(0) + MyWallet.getBalanceForAccount(1))
      
      return
    )
    
    it "should return the sum of all legacy addresses", inject((Wallet, MyWallet) ->
      expect(Wallet.total("imported")).toBeGreaterThan(0)
      expect(Wallet.total("imported")).toBe(MyWallet.getTotalBalanceForActiveLegacyAddresses())
      
      return
    )
    
    return
    
  