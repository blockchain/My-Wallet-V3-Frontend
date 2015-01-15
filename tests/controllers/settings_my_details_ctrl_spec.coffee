describe "SettingsMyDetailsCtrl", ->
  scope = undefined
  Wallet = undefined
  
  modal =
    open: ->
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      
      Wallet.login("test", "test")  
      
      scope = $rootScope.$new()
            
      $controller "SettingsMyDetailsCtrl",
        $scope: scope,
        $stateParams: {},
        $modal: modal
        
      scope.$digest()
      
      return

    return
    
  describe "email", ->   
    it "should be set on load", inject((Wallet) ->
      expect(scope.user.email).toEqual("steve@me.com")
    )
    
    it "should not spontaniously save", inject((Wallet) ->
      spyOn(Wallet, "changeEmail")
      expect(Wallet.changeEmail).not.toHaveBeenCalled()
      
      return
    )
  
    it "should let user change their email", inject((Wallet) ->
      spyOn(Wallet, "changeEmail").and.callThrough()

      scope.changeEmail("other@me.com")
      
      scope.$digest()
    
      expect(Wallet.changeEmail).toHaveBeenCalledWith("other@me.com")
      expect(scope.user.email).toBe("other@me.com")
      
      return
    )
    
    return
    
  describe "password", ->   
    it "can be changed through modal", inject(($modal) ->
      spyOn(modal, "open")
      scope.changePassword()
      expect(modal.open).toHaveBeenCalled()
    )

    return
  
  describe "password hint", ->   
  
    it "should let user change it", inject((Wallet) ->
      spyOn(Wallet, "changePasswordHint")
      scope.edit.passwordHint = false

      scope.changePasswordHint("Other hint")

          
      expect(Wallet.changePasswordHint).toHaveBeenCalledWith("Other hint")
      
      return
    )