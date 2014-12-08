describe "SettingsAddressesCtrl", ->
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
            
      $controller "SettingsAddressesCtrl",
        $scope: scope,
        $stateParams: {}
        $modal: modal
      
      return
      
    return
  
  describe "Payment requests and addresses", ->  
    beforeEach ->
      Wallet.generatePaymentRequestForAccount(0, numeral(1))
    
    it "should show incomplete payment requests",  inject((Wallet) ->
      expect(scope.requests.length).toBe(1)
    )
    
    it "should have access to account labels",  inject((Wallet) ->
      account = scope.accounts[scope.requests[0].account]
      expect(account).toBe(Wallet.accounts[0])
    )
  
    it "should open a popup with the payment request",  inject((Wallet, $modal) ->
      req = scope.requests[0]
      spyOn(modal, "open")

      scope.open(req)

      expect(modal.open).toHaveBeenCalled()
    )
    
    it "can clear a request",  inject((Wallet) ->
      req = scope.requests[0]
      scope.clear(req)
      expect(scope.requests.length).toBe(0)
    )
    
    it "can accept a request",  inject((Wallet) ->
      req = scope.requests[0]
      scope.accept(req)
      expect(req.complete).toBe(true)
    )
    
    it "should open a popup to generate a new addresss for an account",  inject(($modal) ->
      spyOn(modal, "open")
      scope.generateRequestForAccount(1)
      expect(modal.open).toHaveBeenCalled()
      expect(scope.requests.length).toBe(2)
    )
    
  describe "legacy addresses", ->
    it "should be listed", ->
      expect(scope.legacyAddresses.length).toBeGreaterThan(0)
     
    it "can be archived", ->
      address = scope.legacyAddresses[0]
      expect(address.active).toBe(true)
      scope.archive(address)
      expect(address.active).toBe(false)
      
    it "can be unarchived", ->
      address = scope.legacyAddresses[3]
      expect(address.active).toBe(false)
      scope.unarchive(address)
      expect(address.active).toBe(true)
      
    it "can be deleted", inject((Wallet) ->
      spyOn(window, 'confirm').and.callFake(() ->
        return true
      )
      
      address = scope.legacyAddresses[3]
      before = scope.legacyAddresses.length
      
      spyOn(Wallet, "deleteLegacyAddress").and.callThrough()
      
      scope.delete(address)
      expect(Wallet.deleteLegacyAddress).toHaveBeenCalled()
      expect(scope.legacyAddresses.length).toBe(before - 1)
    )
    
  describe "importAddress()", ->
    it "should open a modal",  inject(($modal) ->
      spyOn(modal, "open")
      scope.importAddress()
      expect(modal.open).toHaveBeenCalled()
    )