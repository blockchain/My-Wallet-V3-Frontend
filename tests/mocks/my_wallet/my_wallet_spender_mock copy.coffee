walletStoreServices = angular.module("myWalletSpenderServices", [])
walletStoreServices.factory "MyWalletSpender", () ->    
  (note, successCallback, errorCallback, listener, getSecondPassword) ->
    spendTo = {
      toAddress: () ->
        successCallback()
      toAccount: () ->
        successCallback()
      toMobile: () ->
        successCallback()
      toEmail: () ->
       successCallback()      
    }
    {
        fromAddress: (fromAddress, amount, feeAmount) ->
          spendTo
        fromAccount: (fromIndex, amount, feeAmount) ->
          spendTo
        sweep: (address, amount) ->
          successCallback()
    }
