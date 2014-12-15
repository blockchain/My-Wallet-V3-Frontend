describe "RequestCtrl", ->
  scope = undefined
  modalInstance =
    close: ->
    dismiss: ->
        
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, localStorageService) ->
      localStorageService.remove("mockWallets")
      
      Wallet = $injector.get("Wallet")      
            
      MyWallet = $injector.get("MyWallet")
      
      Wallet.login("test", "test")  
    
      return

    return
  
  describe "when opening existing request", ->
    beforeEach ->
      angular.mock.inject((Wallet, $rootScope, $controller) ->
        Wallet.generatePaymentRequestForAccount(1, numeral(100000))
                
        scope = $rootScope.$new()
            
        $controller "RequestCtrl",
          $scope: scope,
          $stateParams: {},
          $modalInstance: modalInstance
          request: Wallet.paymentRequests[0] # Set payment request (which doesn't specify the account)

        scope.$apply()
        
      )
      
    it "should show an address if the request is valid",  inject(() ->
        expect(scope.paymentRequestAddress).toBe('1Q57Pa6UQiDBeA3o5sQR1orCqfZzGA7Ddp')
    )
    
    it "should show the amount",  inject((Wallet) ->
      expect(scope.fields.amount).toBe("0.001")
    )
      
    it "should select the correct account ",  inject((Wallet) ->
      expect(scope.fields.to).toBe(Wallet.accounts[1])
    )
    
    it "should cancel payment request when user presses cancel", inject((Wallet) ->
      before = Wallet.paymentRequests.length
      spyOn(Wallet, "cancelPaymentRequest").and.callThrough()
      scope.cancel()
      expect(Wallet.cancelPaymentRequest).toHaveBeenCalled()
      expect(scope.paymentRequest).toBeNull()
      expect(Wallet.paymentRequests.length).toBe(before - 1)
    )
    
    it "should update amount in request if changed in the form", inject(() ->
      scope.fields.amount = "0.1"
      scope.$apply()
      expect(scope.paymentRequest.amount).toBe(10000000)
      
    )
    
  describe "when requesting for a legacy address", ->
    beforeEach ->
      angular.mock.inject((Wallet, $rootScope, $controller) ->
        scope = $rootScope.$new()
        
        $controller "RequestCtrl",
          $scope: scope,
          $stateParams: {},
          $modalInstance: modalInstance
          request: undefined
    
        scope.fields = {amount: "0", to: null, currency: {code: "BTC", type: "Crypto"}  }
  
        # Trigger generation of payment address:
        scope.fields.amount = "1"
        scope.$apply()
      )  
    
    it "should have access to legacy addresses",  inject(() ->
      expect(scope.legacyAddresses).toBeDefined()
      expect(scope.legacyAddresses.length).toBeGreaterThan(0)
    )
    
    it "should combine accounts and active legacy addresses in destinations", ->
      expect(scope.destinations).toBeDefined()
      expect(scope.destinations.length).toBe(scope.accounts.length + scope.legacyAddresses.length - 2) # Two are archived
      
    
    it "should show a payment request address when legacy address is selected", ->
      scope.fields.to = scope.destinations[scope.accounts.length] # The first legacy address
      scope.$digest()
      expect(scope.paymentRequestAddress).toBe(scope.fields.to.address)
      
    it "should show a payment URL when legacy address is selected", ->
      scope.fields.to = scope.destinations[scope.accounts.length] # The first legacy address
      scope.$digest()
      expect(scope.paymentRequestURL).toBeDefined()
      expect(scope.paymentRequestURL).toContain("bitcoin:")
      
      
    it "should show a payment URL with amount when legacy address is selected and amount > 0", ->
      scope.fields.to = scope.destinations[scope.accounts.length] # The first legacy address
      scope.$digest()
      scope.fields.amount = "0.1"
      scope.$digest()
      expect(scope.paymentRequestURL).toBeDefined()
      expect(scope.paymentRequestURL).toContain("amount=0.1")      
      
    it "should not have amount argument in URL if amount is zero, null or empty", ->
      scope.fields.to = scope.destinations[scope.accounts.length] # The first legacy address
      scope.fields.amount = "0"
      scope.$digest()
      expect(scope.paymentRequestURL).toBeDefined()
      expect(scope.paymentRequestURL).not.toContain("amount=")
      
      scope.fields.amount = null
      scope.$digest()
      expect(scope.paymentRequestURL).not.toContain("amount=")
      
      scope.fields.amount = ""
      scope.$digest()
      expect(scope.paymentRequestURL).not.toContain("amount=")
      