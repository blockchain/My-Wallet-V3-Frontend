describe "securityCenterServices", () ->
  Wallet = undefined
  SecurityCenter = undefined
  rootScope = undefined
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, localStorageService, _$rootScope_) ->
      localStorageService.remove("mockWallets")
      
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      SecurityCenter = $injector.get("SecurityCenter")
      rootScope = _$rootScope_
      
            
      spyOn(MyWallet,"fetchWalletJson").and.callThrough()
          
      spyOn(Wallet,"monitor").and.callThrough()
      
      mockObserver = {needs2FA: (() ->)}
      
      Wallet.login("test", "test")
      
      Wallet.status.legacyAddressBalancesLoaded = true
      Wallet.user.isEmailVerified = false
      
      rootScope.$digest()
      
      return

    return  
    
  describe "level", ->   
    # it "should be null before legacy transactions have been loaded", ->
   #    Wallet.status.legacyAddressBalancesLoaded = false
   #    rootScope.$digest()
   #
   #    expect(SecurityCenter.security.level).toBe(null)
      
    it "should start at 0", -> # once legacy transactions have been loaded", ->
      expect(SecurityCenter.security.level).toBe(0)    
    
    it "basic requires a verified email address,  a confirmed recovery phrase and a password hint", ->
      Wallet.user.isEmailVerified = true
      rootScope.$digest()
      expect(SecurityCenter.security.level).toBe(0)
      Wallet.user.passwordHint = true
      rootScope.$digest()
      expect(SecurityCenter.security.level).toBe(0)
      Wallet.status.didConfirmRecoveryPhrase = true
      rootScope.$digest()
      expect(SecurityCenter.security.level).toBe(1)
    
    
    it "level 2 requires 2FA and a verified mobile", ->
      # Level 1:
      Wallet.user.isEmailVerified = true
      Wallet.user.passwordHint = true
      Wallet.status.didConfirmRecoveryPhrase = true
      
      
      Wallet.settings.needs2FA = true
      Wallet.user.isMobileVerified = true
      
      rootScope.$digest()
      expect(SecurityCenter.security.level).toBe(2)

    it "level 3 requires block TOR", -> # and no money in imported addresses", inject((filterFilter)->
      # Level 2:
      Wallet.user.isEmailVerified = true
      Wallet.user.passwordHint = true
      Wallet.status.didConfirmRecoveryPhrase = true      
      Wallet.settings.needs2FA = true
      Wallet.user.isMobileVerified = true
      
      # Level 3:
          
      Wallet.settings.blockTOR = true
      rootScope.$digest()
      expect(SecurityCenter.security.level).toBe(3)
            
      # for address in Wallet.legacyAddresses
    #     address.balance = 0
    #
    #   # Dummy transaction to trigger the watcher:
    #   Wallet.transactions.push {}
    #
    #   rootScope.$digest()
    #   expect(SecurityCenter.security.level).toBe(3)
    