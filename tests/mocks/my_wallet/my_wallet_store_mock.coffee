walletStoreServices = angular.module("myWalletStoreServices", [])
walletStoreServices.factory "MyWalletStore", () ->
  transactions = [];
  
  {
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
      
    # Mock only:
      
    setTransactions: (theTransactions) ->
      transactions = theTransactions
      
    appendTransaction: (transaction) ->
      transactions.push transaction
      
  }