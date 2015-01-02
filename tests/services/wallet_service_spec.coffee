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
            
      spyOn(MyWallet,"fetchWalletJson").and.callThrough()
          
      spyOn(Wallet,"monitor").and.callThrough()
      spyOn(Wallet,"monitorLegacy").and.callThrough()
      
      mockObserver = {needs2FA: (() ->)}
      
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
      
      Wallet.login("test-2FA", "test", null, mockObserver)
      
      expect(Wallet.settings.needs2FA).toBe(true)
      expect(Wallet.status.isLoggedIn).toBe(false)
    )
    
    it "should specify the 2FA method", inject((Wallet) ->
      Wallet.login("test-2FA", "test", null, mockObserver)
      expect(Wallet.settings.twoFactorMethod).toBe(4)
    )
    
    it "should login with  2FA code", inject((Wallet) ->
      Wallet.login("test-2FA", "test", "1234567", mockObserver)
      expect(Wallet.status.isLoggedIn).toBe(true)
    )

    
    return
    
  describe "2FA settings", ->    
    it "can be disabled", inject((Wallet) ->
      Wallet.login("test-2FA", "test", null, mockObserver)
      
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
    
  describe "addressBook()", ->          
    beforeEach ->
      Wallet.login("test", "test")  
      
    it "should find John", inject((Wallet) ->      
      expect(Wallet.addressBook["17gJCBiPBwY5x43DZMH3UJ7btHZs6oPAGq"]).toBe("John")
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
    
  describe "addAddressOrPrivateKey()", ->
    beforeEach ->
      errors = {}
      Wallet.login("test", "test")
      
    it "should recoginize an address as such", ->
      # TODO: use a spy to make sure this gets called
      success = (address) ->
        expect(address.address).toBe("valid_address")
      
      Wallet.addAddressOrPrivateKey("valid_address", success, null)

      # expect(errors).toEqual({})

    it "should derive the address corresponding to a private key", ->
      # TODO: use a spy to make sure this gets called
      success = (address) ->
        expect(address.address).toBe("valid_address")
      
      Wallet.addAddressOrPrivateKey("private_key_for_valid_address", success, null)
      
      
    it "should complain if nothing is entered", ->
      success = () ->
        expect(false).toBe(true)
        
      error = (errors) ->
        expect(errors.invalidInput).toBeDefined()
        
      Wallet.addAddressOrPrivateKey("", success, error)
      
      
    it "should complain if private key already exists", ->
      success = () ->
        expect(false).toBe(true)
        
      error = (errors, address) ->
        expect(errors.addressPresentInWallet).toBeDefined()
        expect(address.address).toBe("some_legacy_address")
      
      address = Wallet.addAddressOrPrivateKey("private_key_for_some_legacy_address", success, error)

    it "should complain if a watch-only address already exists", ->
      success = () ->
        expect(false).toBe(true)
      
      error = (errors, address) ->
        expect(address.address).toBe("some_legacy_watch_only_address")
        expect(errors.addressPresentInWallet).toBeDefined()
        
      Wallet.addAddressOrPrivateKey("some_legacy_watch_only_address", success, error)
    
    it "should add private key to existing watch-only address", ->
      success = (address) ->
        expect(Wallet.legacyAddresses[1].isWatchOnlyLegacyAddress).toBe(false)
        expect(address.address).toBe("some_legacy_watch_only_address")
        
      error = () ->
        expect(false).toBe(true)
      
      Wallet.addAddressOrPrivateKey("private_key_for_some_legacy_watch_only_address", success, error)
      
    it "should complain if input is invalid", ->
      success = () ->
        expect(false).toBe(true)
        
      error = (errors) ->
        expect(errors.invalidInput).toBeDefined()
      
      Wallet.addAddressOrPrivateKey("invalid address", success, error)
