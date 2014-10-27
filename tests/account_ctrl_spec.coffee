describe "AccountCtrl", ->
  scope = undefined
  modalInstance =
    close: ->
    dismiss: ->
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      
      Wallet.login("test", "test")  
      
      scope = $rootScope.$new()
            
      $controller "AccountCtrl",
        $scope: scope,
        $stateParams: {},
        $modalInstance: modalInstance
        
      scope.$digest()
      
      return

    return
    
  it "specs should be logged in by default",  inject((Wallet, $state) ->
    expect(scope.status.isLoggedIn).toBe(true)    
  
    return
  )
    
  it "should logout",  inject((Wallet, $stateParams) ->
    spyOn(Wallet, "logout").and.callThrough()
    
    scope.logout()
    
    expect(Wallet.logout).toHaveBeenCalled()
    
    expect(scope.status.isLoggedIn).toBe(false)    
    
    return
  )  
  
  it "should not logout if save is in progress",  inject((Wallet, MyWallet, $stateParams) ->
    spyOn(Wallet, "logout").and.callThrough()
    
    MyWallet.sync()
    
    scope.logout()
    
    expect(Wallet.logout).not.toHaveBeenCalled()
    
    expect(scope.status.isLoggedIn).toBe(true)    
    
    return
  )
  
  describe "language", ->   
    it "should be set on load", inject((Wallet) ->
      expect(scope.settings.language).toEqual({code: "en", name: "English"})
    )
    
    it "should not spontaniously save", inject((Wallet) ->
      spyOn(Wallet, "setLanguage")
      expect(Wallet.setLanguage).not.toHaveBeenCalled()
      
      return
    )
  
    it "should switch to another language", inject((Wallet) ->
      spyOn(Wallet, "setLanguage")
        
      expect(scope.languages.length).toBeGreaterThan(1)
      expect(scope.settings.language).not.toBeNull()
      expect(scope.settings.language).not.toEqual(scope.languages[0]) # English is not the first one in the list
    
      # Switch language:
      scope.settings.language = scope.languages[0]
      
      scope.$digest()
    
      expect(Wallet.setLanguage).toHaveBeenCalledWith(scope.languages[0])
      
      return
    )
    
    return