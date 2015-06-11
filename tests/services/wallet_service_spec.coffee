describe "walletServices", () ->
  Wallet = undefined
  MyWallet = undefined
  mockObserver = undefined  
  errors = undefined
  MyBlockchainSettings = undefined
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, localStorageService) ->
      localStorageService.remove("mockWallets")
      
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      MyBlockchainSettings = $injector.get("MyBlockchainSettings")
            
      spyOn(MyWallet,"fetchWalletJson").and.callThrough()
          
      spyOn(Wallet,"monitor").and.callThrough()
      
      mockObserver = {
        needs2FA: (() ->), 
        success: (() ->), 
        error: (() ->)}
      
      return

    return
        
  describe "transactions", ->           
    beforeEach ->
      Wallet.login("test", "test")  
       
    it "should listen for on_tx and on_block", inject((Wallet, MyWallet) ->
            
      MyWallet.mockShouldReceiveNewTransaction()
            
      expect(Wallet.  monitor).toHaveBeenCalled()
      
      MyWallet.mockShouldReceiveNewBlock()
      
      expect(Wallet.  monitor).toHaveBeenCalled()
      
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
      spyOn(MyBlockchainSettings, "change_language").and.callThrough()
      Wallet.changeLanguage(Wallet.languages[0])
      expect(MyBlockchainSettings.change_language).toHaveBeenCalled()
      expect(MyBlockchainSettings.change_language.calls.argsFor(0)[0]).toBe("de")
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
      
    it "can be switched", inject((Wallet, MyWallet) ->
      spyOn(MyBlockchainSettings, "change_local_currency").and.callThrough()
      Wallet.changeCurrency(Wallet.currencies[1])
      expect(MyBlockchainSettings.change_local_currency).toHaveBeenCalledWith("EUR")
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
      spyOn(MyBlockchainSettings, "change_email").and.callThrough()
      Wallet.changeEmail("other@me.com", mockObserver.success, mockObserver.error)
      expect(MyBlockchainSettings.change_email).toHaveBeenCalled()
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
      spyOn(MyBlockchainSettings, "changeMobileNumber").and.callThrough()
      newNumber = {country: "+31", number: "0100000000"}
      Wallet.changeMobile(newNumber, (()->),(()->))
      expect(MyBlockchainSettings.changeMobileNumber).toHaveBeenCalled()
      expect(Wallet.user.mobile).toBe(newNumber)
      expect(Wallet.user.isMobileVerified).toBe(false)
    )
    
    it "can be verified", inject((Wallet, MyWallet) ->
      spyOn(MyBlockchainSettings, "verifyMobile").and.callThrough()

      Wallet.verifyMobile("12345", (()->),(()->))
      
      expect(MyBlockchainSettings.verifyMobile).toHaveBeenCalled()
      
      expect(Wallet.user.isMobileVerified).toBe(true)
    
      return
    )
    
    return
  
  describe "password", ->    
    beforeEach ->
      Wallet.login("test", "test")  
      
    it "can be checked", inject((Wallet, MyWallet, MyWalletStore) ->
      expect(MyWalletStore.isCorrectMainPassword("test")).toBe(true)
    )
      
    it "can be changed", inject((Wallet, MyWallet, MyWalletStore) ->
      spyOn(MyWalletStore, "changePassword").and.callThrough()
      Wallet.changePassword("newpassword")
      expect(MyWalletStore.changePassword).toHaveBeenCalled()
      expect(MyWalletStore.isCorrectMainPassword("newpassword")).toBe(true)
    )
    
    return
    
  describe "password hint", ->    
    beforeEach ->
      Wallet.login("test", "test")  
      
    it "should be set after loading", inject((Wallet) ->
      expect(Wallet.user.passwordHint).toEqual("Same as username")
    )

    it "can be changed", inject((Wallet, MyWallet) ->
      spyOn(MyBlockchainSettings, "update_password_hint1").and.callThrough()
      Wallet.changePasswordHint("Better hint", mockObserver.success, mockObserver.error)
      expect(MyBlockchainSettings.update_password_hint1).toHaveBeenCalled()
      expect(Wallet.user.passwordHint).toBe("Better hint")
    )
    
    return
    
  describe "currency conversion", ->    
    beforeEach ->
      Wallet.login("test", "test")  
      
    it "should know the exchange rate in satoshi per unit of fiat", inject((Wallet) ->
      expect(Wallet.conversions.EUR.conversion).toBe(400000)
    )
  
    it "should calculate BTC from fiat amount and currency", inject((Wallet) ->
      expect(Wallet.fiatToSatoshi("2", "EUR")).toBe(800000)
    )
    
    it "should calculate fiat from BTC", inject((Wallet) ->
      expect(Wallet.BTCtoFiat("0.1", "EUR")).toBe("25.00")
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
      expect(Wallet.total("accounts")).toBeGreaterThan(0)
      expect(Wallet.total("accounts")).toBe(MyWallet.getBalanceForAccount(0) + MyWallet.getBalanceForAccount(1))
      
      return
    )
    
    it "should return the sum of all legacy addresses", inject((Wallet, MyWallet, MyWalletStore) ->
      expect(Wallet.total("imported")).toBeGreaterThan(0)
      expect(Wallet.total("imported")).toBe(MyWalletStore.getTotalBalanceForActiveLegacyAddresses())
      
      return
    )
    
    return
    
  describe "addAddressOrPrivateKey()", ->
    beforeEach ->
      errors = {}
      Wallet.login("test", "test")
      
    it "should recoginize an address as such", ->
      # TODO: use a spy to make sure this gets called
      success = (address) ->
        expect(address.address).toBe("valid_address")
      
      Wallet.addAddressOrPrivateKey("valid_address", null, success, null)

      # expect(errors).toEqual({})

    it "should derive the address corresponding to a private key", ->
      # TODO: use a spy to make sure this gets called
      success = (address) ->
        expect(address.address).toBe("valid_address")
      
      Wallet.addAddressOrPrivateKey("private_key_for_valid_address", null, success, null)
      
      
    it "should complain if nothing is entered", ->
      success = () ->
        expect(false).toBe(true)
        
      error = (errors) ->
        expect(errors.invalidInput).toBeDefined()
        
      Wallet.addAddressOrPrivateKey("", null, success, error)
      
      
    it "should complain if private key already exists", ->
      success = () ->
        expect(false).toBe(true)
        
      error = (errors, address) ->
        expect(errors.addressPresentInWallet).toBeDefined()
      
      address = Wallet.addAddressOrPrivateKey("private_key_for_some_legacy_address", null, success, error)

    it "should complain if a watch-only address already exists", ->
      success = () ->
        expect(false).toBe(true)
      
      error = (errors) ->
        expect(errors.addressPresentInWallet).toBeDefined()
                
      Wallet.addAddressOrPrivateKey("some_legacy_watch_only_address", null, success, error)
    
    it "should add private key to existing watch-only address", ->
      success = (address) ->
        expect(Wallet.legacyAddresses[1].isWatchOnlyLegacyAddress).toBe(false)
        expect(address.address).toBe("some_legacy_watch_only_address")
        
      error = () ->
        expect(false).toBe(true)
            
      Wallet.addAddressOrPrivateKey("private_key_for_some_legacy_watch_only_address", null, success, error)
      
    it "should complain if input is invalid", ->
      success = () ->
        expect(false).toBe(true)
        
      error = (errors) ->
        expect(errors.invalidInput).toBeDefined()
      
      Wallet.addAddressOrPrivateKey("invalid address", null, success, error)
      
    it "should ask for BIP 38 password if needed", ->
      callbacks = {
        success: () ->
          
        needsBip38: (callback) ->
          callback("5678")
      }
     
      spyOn(callbacks, "needsBip38").and.callThrough()
      spyOn(callbacks, "success").and.callThrough()
    
      Wallet.addAddressOrPrivateKey("BIP38 key", callbacks.needsBip38, callbacks.success, null)
     
      expect(callbacks.needsBip38).toHaveBeenCalled()
      expect(callbacks.success).toHaveBeenCalled()
      
  describe "displayReceivedBitcoin()", ->
    it "should display an alert", ->
      spyOn(Wallet, "displayAlert")
      Wallet.displayReceivedBitcoin()
      expect(Wallet.displayAlert).toHaveBeenCalled()
      
  describe "notifications", ->      
    describe "on_tx", ->
      beforeEach ->
        spyOn(Wallet, "displayReceivedBitcoin")
        
      it "should display a message if the user received bitcoin", ->
        spyOn(Wallet, "updateTransactions").and.callFake () ->
          Wallet.transactions.push {result: 1}
        
        Wallet.monitor("on_tx")
        expect(Wallet.displayReceivedBitcoin).toHaveBeenCalled()
        
      it "should not display a message if the user spent bitcoin", ->
        spyOn(Wallet, "updateTransactions").and.callFake () ->
          Wallet.transactions.push {result: -1}
          
        Wallet.monitor("on_tx")
        expect(Wallet.displayReceivedBitcoin).not.toHaveBeenCalled()

      it "should not display a message if the user moved bitcoin between accounts", ->
        spyOn(Wallet, "updateTransactions").and.callFake () ->
          Wallet.transactions.push {result: 1, intraWallet: true}
          
        Wallet.monitor("on_tx")
        expect(Wallet.displayReceivedBitcoin).not.toHaveBeenCalled()
        
  describe "fetchMoreTransactions()", ->
    it "should call the right method for individual accounts", ->
      spyOn(MyWallet, "fetchMoreTransactionsForAccount")
      Wallet.fetchMoreTransactions(0)
      expect(MyWallet.fetchMoreTransactionsForAccount).toHaveBeenCalled()
    
    it "should call the right method for all accounts combined", ->
      spyOn(MyWallet, "fetchMoreTransactionsForAccounts")
      Wallet.fetchMoreTransactions("accounts")      
      expect(MyWallet.fetchMoreTransactionsForAccounts).toHaveBeenCalled()
    
    it "should call the right method for imported addresses", ->
      spyOn(MyWallet, "fetchMoreTransactionsForLegacyAddresses")
      Wallet.fetchMoreTransactions("imported")    
      expect(MyWallet.fetchMoreTransactionsForLegacyAddresses).toHaveBeenCalled()   
      
    it "should the caller know if there are no more transactions", ->
      observer = 
        allTransactionsLoadedCallback: () -> 
          
      MyWallet.mockShouldFetchOldestTransaction()
          
      spyOn(observer, "allTransactionsLoadedCallback")
      Wallet.fetchMoreTransactions("imported", (()->), (()->), observer.allTransactionsLoadedCallback)    
    
      expect(observer.allTransactionsLoadedCallback).toHaveBeenCalled()
      
    it "should call appendTransactions()", ->
      spyOn(Wallet, "appendTransactions")
      Wallet.fetchMoreTransactions(0, (()->), (()->), (()->))
      expect(Wallet.appendTransactions).toHaveBeenCalled()
      
  describe "appendTransactions()", ->
    it "should add a new transaction", ->
      transaction1 = {hash: "123456890"}
      Wallet.appendTransactions([transaction1])
      expect(Wallet.transactions.pop().hash).toBe(transaction1.hash)
      
    it "should ignore a known transaction", ->
      transaction1 = {hash: "123456890", result: 0}
      transaction2 = {hash: "123456890", result: 1}
      
      Wallet.appendTransactions([transaction1])
      Wallet.appendTransactions([transaction2]) # Same hash: should be ignored
      
      lastTx = Wallet.transactions.pop()
      expect(lastTx.result).not.toBe(transaction2.result)
      expect(lastTx.result).toBe(transaction1.result)
            
    it "should update an existing transaction if override flag is set", ->
      transaction1 = {hash: "123456890", result: 0}
      transaction2 = {hash: "123456890", result: 1}
      
      Wallet.appendTransactions([transaction1])
      Wallet.appendTransactions([transaction2], true) 
      
      expect(Wallet.transactions.pop().result).toBe(transaction2.result)