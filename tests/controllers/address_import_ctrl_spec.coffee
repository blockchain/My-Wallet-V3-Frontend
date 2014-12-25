describe "AddressImportCtrl", ->
  scope = undefined
  Wallet = undefined
  
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
                  
      $controller "AddressImportCtrl",
        $scope: scope,
        $stateParams: {},
        $modalInstance: modalInstance        
      
      return
      
    scope.$digest()

    return
    
  it "should exist",  inject(() ->
    expect(scope.close).toBeDefined() 
  
    return
  )
  
  it "should have access to legacy addresses",  inject(() ->
    expect(scope.legacyAddresses).toBeDefined()    
  )
  
  describe "enter address or private key", ->
  
    it "should go to step 2 when user clicks validate", ->
      scope.fields.addressOrPrivateKey = "valid_import_address"
      scope.$digest()
      expect(scope.step).toBe(1)
      scope.validate()
      expect(scope.step).toBe(2)
  
  describe "validate and add", ->
    it "should add the address if no errors are present", ->
      scope.fields.addressOrPrivateKey = "valid_import_address"
      scope.validate()
      scope.$digest()
      expect(scope.address.address).toBe("valid_import_address")
    
      
    it "should not allow the user to add an address if errors are present", ->
      scope.errors.someRandomError = true
      scope.validate()
      scope.$digest()
      expect(scope.address).toBeNull()
      
    it "should show the balance", ->
      scope.fields.addressOrPrivateKey = "valid_import_address"
      scope.validate()
      scope.$digest()
      expect(scope.address.balance).not.toBe(0)
      
    it "should go to step 3 when user clicks transfer", ->
      scope.goToTransfer()
      expect(scope.step).toBe(3)
    
  describe "transfer", ->
    beforeEach ->
      scope.address = Wallet.legacyAddresses[0]
      
    it "should have access to accounts", ->
      expect(scope.accounts).toBeDefined()
  
    it "should sweep address if user clicks continue", inject((Wallet) ->
      spyOn(Wallet, "sweepLegacyToAccount") #.and.callThrough()
      scope.transfer()
      expect(Wallet.sweepLegacyToAccount).toHaveBeenCalled()
      # expect(scope.address.balance).toBe(0)
    )
  