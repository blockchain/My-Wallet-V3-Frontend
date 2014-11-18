describe "SettingsWalletCtrl", ->
  scope = undefined
  Wallet = undefined
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      
      spyOn(Wallet, "setLanguage").and.callThrough()
      spyOn(Wallet, "changeLanguage").and.callThrough()
      spyOn(Wallet, "changeCurrency").and.callThrough()
            
      scope = $rootScope.$new()
            
      $controller "SettingsWalletCtrl",
        $scope: scope,
        $stateParams: {},
        
      scope.$digest()
      
      return

    return
    
  describe "language", ->   
    beforeEach ->
      Wallet.login("test", "test")   
      scope.$digest()  
    
    it "should be set on load", inject(() ->
      expect(Wallet.status.isLoggedIn).toBe(true)
      expect(scope.settings.language).toEqual({code: "en", name: "English"})
      return
    )
    
    it "should not spontaniously save", inject((Wallet) ->
      scope.$digest()
      
      expect(Wallet.changeLanguage).not.toHaveBeenCalled()
      
      return
    )
  
    it "should switch to another language", inject((Wallet) ->
        
      expect(scope.languages.length).toBeGreaterThan(1)
      expect(scope.settings.language).not.toBeNull()
      expect(scope.settings.language).not.toEqual(scope.languages[0]) # English is not the first one in the list
    
      # Switch language:
      scope.settings.language = scope.languages[0]
      
      scope.$digest()
    
      expect(Wallet.changeLanguage).toHaveBeenCalledWith(scope.languages[0])
      
      return
    )
    
    return
  
    
  describe "currency", ->   
    beforeEach ->
      Wallet.login("test", "test")  
      scope.$digest()
            
    it "should be set on load", inject((Wallet) ->
      expect(scope.settings.currency.code).toEqual("USD")
    )
    
    it "should not spontaniously save", inject((Wallet) ->
      scope.$digest()
      expect(Wallet.changeCurrency).not.toHaveBeenCalled()
      
      return
    )
  
    it "can be changed", inject((Wallet) ->        
      expect(scope.currencies.length).toBeGreaterThan(1)
      expect(scope.settings.currency).not.toBeNull()
    
      # Switch language:
      scope.settings.currency = scope.currencies[1]
      
      scope.$digest()
    
      expect(Wallet.changeCurrency).toHaveBeenCalledWith(scope.currencies[1])
      
      return
    )
    
    return

      