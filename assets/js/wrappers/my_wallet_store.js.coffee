walletStoreServices = angular.module("myWalletStoreServices", [])
walletStoreServices.factory "MyWalletStore", () ->
  {
    getLanguages: () ->
      {de: "Deutch", en: "English", nl: "Nederlands"}
    
    getCurrencies: () ->
      {USD: "US Dollar", EUR: "Euro"}
      
  }