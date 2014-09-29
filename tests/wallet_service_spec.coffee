describe "walletServices", ->
  Wallet = undefined
  MyWallet = undefined
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      
      return
    return
    
  describe "login", ->
    it "should fetch and decrypt the wallet", inject((Wallet, MyWallet, $timeout) ->
      spyOn(MyWallet,"setGUID")#.and.callThrough()
      spyOn(MyWallet,"restoreWallet")
      
      Wallet.login("uid", "pwd")
      
      expect(MyWallet.setGUID).toHaveBeenCalledWith("uid")
      
      $timeout.flush()
      expect(MyWallet.restoreWallet).toHaveBeenCalledWith("pwd")
      
      
      return
    )
    return