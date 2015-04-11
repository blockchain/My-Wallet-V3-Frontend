describe "walletServices", () ->
  Wallet = undefined
  MyWallet = undefined
  errors = undefined
  mockObserver = undefined
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, localStorageService) ->
      localStorageService.remove("mockWallets")
      
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      
      mockObserver = 
        success: () ->
          return
        error: () ->
          return
                      
      return

    return
    
  describe "send()", ->   
    beforeEach ->
      Wallet.login("test", "test")  
      
      return
     
    # it "should call the right functions", inject((Wallet, MyWallet, MyWalletSpender) ->
   #    spyOn(MyWalletSpender,"prepareFromAccount")
   #
   #    Wallet.transaction(mockObserver.success, mockObserver.error).send(Wallet.accounts[0], {address: "destination_address", type: "External"}, numeral("1.0"), "BTC")
   #
   #    expect(MyWalletSpender.prepareFromAccount).toHaveBeenCalled()
   #
   #    return
   #  )
   #
   #  it "should convert BTC to Satoshi", inject((Wallet, MyWallet) ->
   #    spyOn(MyWallet,"sendBitcoinsForAccount")
   #
   #    Wallet.transaction(mockObserver.success, mockObserver.error).send(Wallet.accounts[0], {address: "destination_address", type: "External"}, "1", "BTC")
   #
   #    expect(MyWallet.sendBitcoinsForAccount.calls.mostRecent().args[2]).toBe(100000000)
   #
   #    return
   #  )
   #
   #  it "should call success callback if all goes well", inject((Wallet, MyWallet) ->
   #    spyOn(mockObserver, "success")
   #
   #    Wallet.transaction(mockObserver.success, mockObserver.error).send(Wallet.accounts[0], {address: "destination_address", type: "External"}, numeral("1.0"), "BTC")
   #
   #    expect(mockObserver.success).toHaveBeenCalled()
   #
   #    return
   #  )
   #
   #  it "should update the account balance if successful", inject((Wallet, MyWallet) ->
   #    before = Wallet.accounts[0].balance
   #
   #    Wallet.transaction(mockObserver.success, mockObserver.error).send(Wallet.accounts[0], {address: "destination_address", type: "External"}, numeral("1.0"), "BTC")
   #
   #    expect(Wallet.accounts[0].balance).toBe(before - 1.0 * 100000000)
   #
   #    return
   #  )
   #
   #  it "should update transactions if successful", inject((Wallet, MyWallet) ->
   #    before = Wallet.transactions.length
   #
   #    Wallet.transaction(mockObserver.success, mockObserver.error).send(Wallet.accounts[0], {address: "destination_address", type: "External"}, numeral("1.0"), "BTC")
   #
   #    expect(Wallet.transactions.length).toBe(before + 1)
   #
   #    return
   #  )
   #
   #  it "should call error callback if there's problem", inject((Wallet, MyWallet) ->
   #    MyWallet.mockShouldFailToSend()
   #
   #    spyOn(mockObserver, "error")
   #
   #    Wallet.transaction(mockObserver.success, mockObserver.error).send(Wallet.accounts[0], {address: "destination_address", type: "External"}, numeral("1.0"), "BTC")
   #
   #    expect(mockObserver.error).toHaveBeenCalled()
   #
   #    return
   #  )
   #
   #  it "should spend money", inject((Wallet, MyWallet) ->
   #
   #    before = Wallet.accounts[0].balance
   #
   #    Wallet.transaction(mockObserver.success, mockObserver.error).send(Wallet.accounts[0], {address: "destination_address", type: "External"}, numeral("1.0"), "BTC")
   #
   #    Wallet.refresh()
   #
   #    after = Wallet.accounts[0].balance
   #
   #    expect(before - after).toEqual(100000000)
   #
   #    return
   #  )
    
    return