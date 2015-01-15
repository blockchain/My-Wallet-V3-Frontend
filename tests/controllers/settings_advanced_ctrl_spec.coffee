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