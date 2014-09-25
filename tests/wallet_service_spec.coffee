describe "walletServices", ->
  Wallet = undefined
  MyWallet = undefined
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      $timeout: (f, _) -> f()  # Doesn't work?
      
      return
    return
    
  describe "login", ->
    it "should fetch and decrypt the wallet", inject((Wallet, MyWallet) ->
      spyOn(MyWallet,"setGUID")
      spyOn(MyWallet,"restoreWallet")
      
      Wallet.login("uid", "pwd")
      
      expect(MyWallet.setGUID).toHaveBeenCalled()
      # expect(MyWallet.restoreWallet).toHaveBeenCalled()
      
            
      return
    )
    return