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
    
  describe "when requesting for a legacy address", ->
    beforeEach ->
      angular.mock.inject((Wallet, $rootScope, $controller) ->
        scope = $rootScope.$new()
        
        $controller "RequestCtrl",
          $scope: scope,
          $stateParams: {},
          $modalInstance: modalInstance
          destination: undefined
    
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
    
    it "should show the amount in BTC", ->
      scope.currency = {code: "EUR", type: "Fiat"}
      scope.$digest()
      expect(scope.paymentRequestAmount).toBe(100000000)