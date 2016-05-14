angular
  .module('walletApp.core')
  .factory 'MyWallet', ($window, $timeout, $log, MyWalletStore) ->
    addressBook = {"address": "Satoshi"}
    accounts = [{ label: 'Savings', archived: false }, { label: 'Party Money', archived: false }, { archived: true }]
    accounts: accounts
    then: (cb) -> cb({
      wallet:
        removeAddressBookEntry: () ->
          address = 'address'
          delete addressBook[address]

        isDoubleEncrypted: false

        newAccount: (label) ->
          accounts.push { label: label }
          return

        getHistory: () ->
          then: () ->
            then: () ->

        txList:
          fetchTxs: () ->

        addressBook: addressBook
        keys: [{ archived: false }, { archived: true }]
        hdwallet:
          accounts: accounts
        status: {didLoadTransactions: false}

        balanceSpendableActiveLegacy: 100000000

        txList:
          subscribe: () -> (() ->)
        fetchMoreTransactionsForAll: (success,error,allTransactionsLoaded) ->
          success()
    })
