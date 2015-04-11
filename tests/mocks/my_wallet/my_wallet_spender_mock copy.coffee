walletStoreServices = angular.module("myWalletSpenderServices", [])
walletStoreServices.factory "MyWalletSpender", () ->  
  # {
  #   # Amount in Satoshi
  #   sendBitcoinsForAccount: (fromAccountIndex,toAddress, amount, fee, note, success, error) ->
  #     if mockRules.shouldFailToSend
  #       error({message: "Reason for failure"})
  #       return
  #
  #     # A few sanity checks (not complete)
  #     if amount > accounts[fromAccountIndex].balance
  #       error({message: "Insufficient funds"})
  #       return
  #
  #     ###
  #     The MyWallet mock parses transactions by just copying them, so the following
  #     transaction is what a real transaction would look like  *after* processing.
  #
  #     The real transaction may have several inputs (from receiving and change address
  #     for this account). A new change address may need to be generated.
  #
  #     Transaction parsing should be able to figure out which account was the sender and
  #     change address and which address represents a recipient.
  #     ###
  #
  #     transaction = {
  #             hash: "hash-" + (new Date()).getTime(),
  #             confirmations: 0
  #             doubleSpend: false
  #             intraWallet: false,
  #             note: null,
  #             txTime: (new Date()).getTime()
  #             from: {account: {index: fromAccountIndex, amount: amount}, legacyAddresses: null, externalAddresses: null},
  #             to: {account: null, legacyAddresses: null, externalAddresses: {addressWithLargestOutput: toAddress, amount: amount}}
  #           }
  #
  #     # MyWallet stores transaction locally (so it already knows it by the time
  #     # it receives the websocket notification).
  #
  #     MyWalletStore.appendTransaction(transaction)
  #     accounts[fromAccountIndex].balance -= amount
  #
  #     # Blockchain.info will know about these transactions:
  #     cookie = localStorageService.get("mockWallets")
  #     cookie[this.uid].accounts[fromAccountIndex].balance -= amount
  #     cookie[this.uid].transactions.push transaction
  #     localStorageService.set("mockWallets", cookie)
  #
  #     success()
  #
  #     return
  #
  #   sendToAccount: (fromAccountIdx, toAccountIdx, amount, feeAmount, note, success, error, getPassword) ->
  #     # A few sanity checks (not complete)
  #     if amount > accounts[fromAccountIdx].balance
  #       error({message: "Insufficient funds"})
  #       return
  #
  #     transaction = {
  #             hash: "hash-" + (new Date()).getTime(),
  #             confirmations: 0
  #             doubleSpend: false
  #             intraWallet: true,
  #             note: null,
  #             txTime: (new Date()).getTime()
  #             from: {account: {index: fromAccountIdx, amount: amount}, legacyAddresses: null, externalAddresses: null},
  #             to:   {account: {index: toAccountIdx, amount: amount}, legacyAddresses: null, externalAddresses: null}
  #           }
  #
  #     MyWalletStore.appendTransaction(transaction)
  #     accounts[fromAccountIdx].balance -= amount
  #     accounts[toAccountIdx].balance += amount
  #
  #     success()
  #
  #     return
  #
  #
  #   sendFromLegacyAddressToAccount: (fromAddress, toAccountIdx, amount, feeAmount, note, success, error, getPassword) ->
  #     transaction = {
  #               hash: "hash-" + (new Date()).getTime(),
  #               confirmations: 0
  #               doubleSpend: false
  #               intraWallet: true,
  #               note: null,
  #               txTime: (new Date()).getTime()
  #               from: {account: null, legacyAddresses: [{address: fromAddress, amount: amount}], externalAddresses: null},
  #               to:   {account: {index: toAccountIdx, amount: amount}, legacyAddresses: null, externalAddresses: null}
  #             }
  #
  #     MyWalletStore.appendTransaction(transaction)
  #     MyWalletStore.setLegacyAddressBalance(fromAddress, MyWalletStore.getLegacyAddressBalance(fromAddress) - amount)
  #     accounts[toAccountIdx].balance += amount
  #
  #     success()
  #
  #     return
  #
  # }
  
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
        prepareFromAddress: (fromAddress, amount, feeAmount, proceed) ->
          proceed(spendTo)
        prepareFromAccount: (fromIndex, amount, feeAmount, proceed) ->
          proceed(spendTo)
        
    }
