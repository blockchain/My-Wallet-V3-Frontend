walletStoreServices = angular.module("myWalletStoreServices", [])
walletStoreServices.factory "MyWalletStore", () ->
  transactions = [];
  
  addressBook = { # The same for everyone
      "17gJCBiPBwY5x43DZMH3UJ7btHZs6oPAGq": "John"
      "1LJuG6yvRh8zL9DQ2PTYjdNydipbSUQeq": "Alice"
  }
  
  legacyAddresses = {}
  
  {
    getPbkdf2Iterations: () ->
      10
      
    setPbkdf2Iterations: () ->
      return
    
    getLanguages: () ->
      {de: "Deutch", en: "English", nl: "Nederlands"}
    
    getCurrencies: () ->
      {USD: "US Dollar", EUR: "Euro"}
      
    didUpgradeToHd: () ->
      true
    
    isMnemonicVerified: () ->
      false
    
    getAllTransactions: (idx) ->
      res = []
      for transaction in transactions
        res.push transaction
  
      return res
      
    getAllLegacyAddresses: () ->
      res = []
      for key, value of legacyAddresses
        res.push key
      return res
    
    getLegacyActiveAddresses: () ->
      activeAddresses = []
      for key, value of legacyAddresses
        unless value.archived
          activeAddresses.push key
      return activeAddresses
    
    getLegacyAddressLabel: (address) ->
      return legacyAddresses[address].label
    
    isWatchOnlyLegacyAddress: (address) ->
      return legacyAddresses[address].privateKey == null
      
    legacyAddressExists: (candidate) ->
      return legacyAddresses[candidate]?
      
    getAddressBook: () ->
      addressBook
      
    getLegacyAddressBalance: (address) ->
      return legacyAddresses[address].balance

    setLegacyAddressBalance: (address, balance) ->
      legacyAddresses[address] = balance
      return

    
    getTotalBalanceForActiveLegacyAddresses: () ->
      tally = 0
      for key, value of legacyAddresses
        tally += value.balance
      return tally
    
    setLegacyAddressLabel: (label) ->
      return
      
    deleteLegacyAddress: (address) ->
      return
      
    archiveLegacyAddr: (address) ->
      return
  
    unArchiveLegacyAddr: (address) ->
      return    
      
    # Mock only:
      
    setTransactions: (theTransactions) ->
      transactions = theTransactions
      
    appendTransaction: (transaction) ->
      transactions.push transaction
      
    addLegacyAddress: (address, privateKey, balance, label, archived) ->
      legacyAddresses[address] = {privateKey: privateKey, balance: balance, label: label, archived: archived}
      return
      
  }