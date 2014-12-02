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
    
  describe "block TOR requests", ->
    it "has an initial status", ->
      expect(scope.settings.blockTOR).toBe(false)
      
    it "can be enabled", inject((Wallet) -> 
      spyOn(Wallet, "enableBlockTOR").and.callThrough()
      scope.enableBlockTOR()
      expect(Wallet.enableBlockTOR).toHaveBeenCalled()
      expect(scope.settings.blockTOR).toBe(true)
    )
    
    it "can be disabled", inject((Wallet) -> 
      spyOn(Wallet, "disableBlockTOR")
      scope.disableBlockTOR()
      expect(Wallet.disableBlockTOR).toHaveBeenCalled()
    )
  
  describe "remember 2FA", ->
    it "pending", ->
      pending()
      
    # it "has an initial status", ->
    #   expect(scope.settings.rememberTwoFactor).toBe(false)
    #
    # it "can be enabled", inject((Wallet) ->
    #   spyOn(Wallet, "disableRememberTwoFactor")
    #   scope.enableBlockTOR()
    #   expect(Wallet.disableRememberTwoFactor).toHaveBeenCalled()
    # )
    #
    # it "can be disabled", inject((Wallet) ->
    #   spyOn(Wallet, "enableRememberTwoFactor")
    #   scope.disableBlockTOR()
    #   expect(Wallet.enableRememberTwoFactor).toHaveBeenCalled()
    # )
      
  describe "second password", ->
    it "pending", ->
      pending()