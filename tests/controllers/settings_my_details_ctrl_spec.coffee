describe "SettingsMyDetailsCtrl", ->
  scope = undefined
  Wallet = undefined
  
  modal =
    open: ->
      
  mockObserver = {
    success: (() ->), 
    error: (() ->)}
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      Wallet.user = {email: "steve@me.com"}
      Wallet.settings_api = 
        change_email: (email, success, error) -> success()
        update_password_hint1: (hint, success, error) -> 
          if hint == "आपकी पसंदीदा"
            error(101)
          else
            success()
            
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

      scope.changeEmail("other@me.com", mockObserver.success, mockObserver.error)
      
      scope.$digest()
    
      expect(Wallet.changeEmail).toHaveBeenCalledWith("other@me.com", mockObserver.success, mockObserver.error)
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

      scope.changePasswordHint("Other hint", mockObserver.success, mockObserver.error)

          
      expect(Wallet.changePasswordHint).toHaveBeenCalled()
      
      return
    )

    it "should not change to an improper value", inject((Wallet) ->
      scope.edit.passwordHint = false
      expect(scope.errors.passwordHint).not.toBeDefined()

      scope.changePasswordHint("आपकी पसंदीदा", mockObserver.success, mockObserver.error)
      expect(scope.errors.passwordHint).toBeDefined()
      
      return
    )