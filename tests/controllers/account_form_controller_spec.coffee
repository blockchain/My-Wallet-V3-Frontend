describe "AccountFormCtrl", ->
  scope = undefined
  
  modalInstance = 
    close: ->
    dismiss: ->      
        
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, localStorageService, $rootScope, $controller) ->
      localStorageService.remove("mockWallets")
          
      Wallet = $injector.get("Wallet")      
          
      MyWallet = $injector.get("MyWallet")
            
      Wallet.login("test", "test")
      
      scope = $rootScope.$new()
      
      scope.$digest()
            
      return

    return
    
  describe "creation", ->  
    beforeEach ->
      angular.mock.inject ($injector, localStorageService, $rootScope, $controller) ->      
        Wallet = $injector.get("Wallet")      
            
        MyWallet = $injector.get("MyWallet")
            
        scope = $rootScope.$new()
        

          
        $controller "AccountFormCtrl",
          $scope: scope,
          $stateParams: {},
          $modalInstance: modalInstance
          account: undefined
      
        return
      
      scope.fields = {name: "New Account"}
      scope.$digest()
            
    it "should be created",  inject((Wallet) ->      
      before = Wallet.accounts.length
      scope.createAccount()
      expect(Wallet.accounts.length).toBe(before + 1)
    )
  
    it "should have a name",  inject((Wallet) ->
      scope.createAccount()
      expect(Wallet.accounts[Wallet.accounts.length - 1].label).toBe("New Account")
    )
  
    it "name should be 1 character or more",  inject((Wallet) ->
      expect(scope.formIsValid).toBe(true)
      scope.fields.name = ""
      scope.$digest()
      expect(scope.formIsValid).toBe(false)
    )
    
    it "should show a confirmation modal", inject(($modal)->
      spyOn($modal, "open").and.callThrough()
      scope.createAccount()
      expect($modal.open).toHaveBeenCalled()
      expect($modal.open.calls.argsFor(0)[0].windowClass).toEqual("notification-modal")
    )
    
  describe "rename", ->
    beforeEach ->
      angular.mock.inject ($injector, localStorageService, $rootScope, $controller) ->
      
        Wallet = $injector.get("Wallet")      
            
        MyWallet = $injector.get("MyWallet")
        
        scope = $rootScope.$new()
                        
        $controller "AccountFormCtrl",
          $scope: scope,
          $stateParams: {},
          $modalInstance: modalInstance
          account: Wallet.accounts[0]
              
        scope.$digest()
              
    it "original name should be shown", ->
      expect(scope.fields.name).toBe("Savings")
      
    it "should save the new name",  inject((Wallet) ->
      scope.fields.name = "New Name"
      scope.updateAccount()
      expect(Wallet.accounts[0].label).toBe("New Name")
    )