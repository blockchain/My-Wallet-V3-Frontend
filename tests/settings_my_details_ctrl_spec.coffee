describe "SettingsMyDetailsCtrl", ->
  scope = undefined
  
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
    
  describe "mobile", ->   
    it "should be set on load", inject((Wallet) ->
      expect(scope.user.mobile).toEqual("+3112345678")
    )
    
    it "should not spontaniously save", inject((Wallet) ->
      spyOn(Wallet, "changeMobile")
      expect(Wallet.changeMobile).not.toHaveBeenCalled()
      
      return
    )
  
    it "should let user change it", inject((Wallet) ->
      spyOn(Wallet, "changeMobile")

      scope.changeMobile("+3100000000")
      
      scope.$digest()
    
      expect(Wallet.changeMobile).toHaveBeenCalledWith("+3100000000")
      
      return
    )
    
    it "should validate proposed new number", ->
      expect(scope.validateMobileNumber("")).toBe(false)
      expect(scope.validateMobileNumber("+3100000000")).toBe(true)
      expect(scope.validateMobileNumber("+monkey")).toBe(false)
      expect(scope.validateMobileNumber("+1800monkey")).toBe(false)

    return
    
  describe "password", ->   
    it "can be changed through modal", inject(($modal) ->
      spyOn(modal, "open")
      scope.changePassword()
      expect(modal.open).toHaveBeenCalled()
    )

    return
  