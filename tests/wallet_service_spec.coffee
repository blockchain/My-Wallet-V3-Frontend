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
    beforeEach ->
      spyOn(MyWallet,"setGUID")#.and.callThrough()
      spyOn(MyWallet,"restoreWallet")
      
      Wallet.login("uid", "pwd")
      
    it "should fetch and decrypt the wallet", inject((Wallet, MyWallet, $timeout) ->
      expect(MyWallet.setGUID).toHaveBeenCalledWith("uid")
      $timeout.flush()
      expect(MyWallet.restoreWallet).toHaveBeenCalledWith("pwd")
      
      return
    )
    
    it "should update the status", inject((Wallet, MyWallet, $timeout) ->
      $timeout.flush()
      expect(Wallet.status.isLoggedIn).toBeTrue
      return
    )
    
    it "should get the language", inject((Wallet, MyWallet, $timeout) ->
      $timeout.flush()
      expect(Wallet.settings.language).toEqual "en"
      return
    )
    
    it "should get the currency", inject((Wallet, MyWallet, $timeout) ->
      $timeout.flush()
      expect(Wallet.settings.currency.code).toEqual "USD"
      return
    )
    
    return