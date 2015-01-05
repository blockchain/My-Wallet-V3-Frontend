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
    
  describe "second password", ->
    # Enable, disable, prompt
    it "...", ->
      pending()
  
  
  describe "HD upgrade", ->
    it "should prompt the user if upgrade to HD is needed", inject(($rootScope) ->
      
      spyOn($rootScope, '$broadcast').and.callThrough()
      
      Wallet.monitorLegacy("hd_wallets_does_not_exist")
      
      expect($rootScope.$broadcast).toHaveBeenCalled()
      expect($rootScope.$broadcast.calls.argsFor(0)[0]).toEqual("needsUpgradeToHD")
    )
      
    it "should proceed with upgrade if user agrees", inject(($rootScope, MyWallet) ->
      spyOn($rootScope, '$broadcast').and.callFake (message, callback) ->
        if message == "needsUpgradeToHD"
          callback()
      
      spyOn(MyWallet, "initializeHDWallet")
      
      Wallet.monitorLegacy("hd_wallets_does_not_exist")
      
      expect(MyWallet.initializeHDWallet).toHaveBeenCalled()
    )
    
    it "should ask for 2nd password if needed", ->
      pending()
      