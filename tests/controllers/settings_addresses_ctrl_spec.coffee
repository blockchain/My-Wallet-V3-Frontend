describe "SettingsAddressesCtrl", ->
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
            
      $controller "SettingsAddressesCtrl",
        $scope: scope,
        $stateParams: {}
        $modal: modal
      
      return

    return
    
  describe "legacy addresses", ->
    it "should be listed", ->
      expect(scope.legacyAddresses.length).toBeGreaterThan(0)
     
    it "can be archived", ->
      address = scope.legacyAddresses[0]
      expect(address.active).toBe(true)
      scope.archive(address)
      expect(address.active).toBe(false)