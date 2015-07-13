describe "walletServices", () ->
  Wallet = undefined
  MyWallet = undefined
  MyWalletStore = undefined
  
  mockObserver = undefined  
  errors = undefined
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, localStorageService) ->
      localStorageService.remove("mockWallets")
      
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      MyWalletStore = $injector.get("MyWalletStore")
      
      spyOn(MyWallet,"login").and.callThrough()
          
      spyOn(Wallet,"monitor").and.callThrough()
      
      mockObserver = {needs2FA: (() ->)}
            
      return

    return
  describe "addressBook()", ->          
    it "should find John", inject((Wallet) ->      
      expect(Wallet.addressBook["17gJCBiPBwY5x43DZMH3UJ7btHZs6oPAGq"]).toBe("John")
      return
    )
    
    return

  describe "address label", ->
    it "can be set for a legacy address", ->
      address = Wallet.legacyAddresses[0]
      spyOn(MyWalletStore, "setLegacyAddressLabel")
      Wallet.changeAddressLabel(address, "New Label")
      expect(MyWalletStore.setLegacyAddressLabel).toHaveBeenCalled()
    
    it "can be set for an HD address", ->
      address = Wallet.hdAddresses[0]
      spyOn(MyWallet, "setLabelForAccountAddress")
      Wallet.changeAddressLabel(address, "New Label")
      expect(MyWallet.setLabelForAccountAddress).toHaveBeenCalled()     
       
    it "each account should have at least one address without a label", ->
      pending()
          