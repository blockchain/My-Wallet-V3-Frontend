describe "SettingsAdvancedCtrl", ->
  scope = undefined
  Wallet = undefined
    
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      
      Wallet.login("test", "test")  
      
      scope = $rootScope.$new()
            
      $controller "SettingsAdvancedCtrl",
        $scope: scope,
        $stateParams: {},
        
      scope.$digest()
      
      return

    return

  it "should have access to wallet settings", inject((Wallet) ->
    expect(scope.settings).toBe(Wallet.settings)
    return
  )

  describe "pbkdf2", ->

    it "should be valid Pbkdf2", ->
      expect(scope.validatePbkdf2(1)).toBe(true)
      expect(scope.validatePbkdf2(0)).toBe(false)

    it "can set Pbkdf2", inject((Wallet) ->
      spyOn(Wallet, "setPbkdf2Iterations")
      spyOn(Wallet, "displayError")
      scope.changePbkdf2(10)
      expect(Wallet.setPbkdf2Iterations).toHaveBeenCalled()
      expect(Wallet.displayError).not.toHaveBeenCalled()

      return
    )

  describe "whitelist", ->

    describe "whitelist validation", ->

      it "should return MAX_CHARACTERS error", ->
        n = ''
        for i in [0..255] by 1
          n += 'a'
        expect(scope.validateIpWhitelist(n)).toBe(false)

      it "should return MAX_IP_ADDRESSES error", ->
        n = ''
        for i in [0..9] by 1
          n += 'a,'
        expect(scope.validateIpWhitelist(n)).toBe(false)

      it "should return NOT_ALLOWED error", ->
        expect(scope.validateIpWhitelist('300.300.300.300')).toBe(false)

      it "should return true, no errors", ->
        expect(scope.validateIpWhitelist('1.2.3.4')).toBe(true)

    it "can change IP whitelist", inject((Wallet) ->
      spyOn(Wallet, "setIPWhitelist")
      spyOn(Wallet, "displayError")
      scope.changeIpWhitelist([])
      expect(Wallet.setIPWhitelist).toHaveBeenCalled()
      expect(Wallet.displayError).not.toHaveBeenCalled()

      return
    )

  describe "remember 2FA", ->

    it "has an initial status", ->
      expect(scope.settings.rememberTwoFactor).toBe(true)
      return
    
    it "can be enabled", inject((Wallet) ->
      spyOn(Wallet, "enableRememberTwoFactor")
      scope.enableRememberTwoFactor()
      expect(Wallet.enableRememberTwoFactor).toHaveBeenCalled()

      return
    )
    
    it "can be disabled", inject((Wallet) ->
      spyOn(Wallet, "disableRememberTwoFactor")
      scope.disableRememberTwoFactor()
      expect(Wallet.disableRememberTwoFactor).toHaveBeenCalled()

      return
    )