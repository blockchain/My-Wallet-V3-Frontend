describe "SettingsAddressesCtrl", ->
  scope = undefined
  Wallet = undefined
  
  modal =
    open: ->
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      
      [{archived: false}]
      
      legacyAddresses = [{archived: false},{archived: true}]
      
      Wallet.legacyAddresses = () ->
        legacyAddresses
      
      Wallet.accounts = () -> []
      
      Wallet.my = 
        wallet:
          deleteLegacyAddress: () ->
            legacyAddresses.pop()
          keys: legacyAddresses
            
      scope = $rootScope.$new()
            
      $controller "SettingsAddressesCtrl",
        $scope: scope,
        $stateParams: {}
        $modal: modal
        Wallet: Wallet
      
      return
      
    return

    
  describe "legacy addresses", ->
    it "should be listed", ->
      expect(scope.legacyAddresses().length).toBeGreaterThan(0)
     
    it "can be archived", ->
      address = scope.legacyAddresses()[0]
      expect(address.archived).toBe(false)
      scope.archive(address)
      expect(address.archived).toBe(true)
      
    it "can be unarchived", ->
      address = scope.legacyAddresses()[1]
      expect(address.archived).toBe(true)
      scope.unarchive(address)
      expect(address.archived).toBe(false)
      
    it "can be deleted", inject((Wallet) ->
      spyOn(window, 'confirm').and.callFake(() ->
        return true
      )
      
      address = scope.legacyAddresses()[1]
      before = scope.legacyAddresses().length
      
      spyOn(Wallet, "deleteLegacyAddress").and.callThrough()
      
      scope.delete(address)
      expect(Wallet.deleteLegacyAddress).toHaveBeenCalled()
            
      expect(scope.legacyAddresses().length).toBe(before - 1)
      
      
    )
    
  describe "importAddress()", ->
    it "should open a modal",  inject(($modal) ->
      spyOn(modal, "open")
      scope.importAddress()
      expect(modal.open).toHaveBeenCalled()
    )

  describe "toggling import addresses", ->
    it "should toggle import address", ->
      spyOn(scope, "toggleDisplayImported").and.callThrough()
      scope.toggleDisplayImported()
      expect(scope.toggleDisplayImported).toHaveBeenCalled()
      expect(scope.display.imported).toBe(true)
      expect(scope.display.archived).toBe(false)

  describe "toggling archived addresses", ->
    it "should toggle archived address", ->
      spyOn(scope, "toggleDisplayArchived").and.callThrough()
      scope.toggleDisplayArchived()
      expect(scope.toggleDisplayArchived).toHaveBeenCalled()
      expect(scope.display.archived).toBe(true)
