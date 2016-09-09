angular.module('walletApp.core').factory 'MyWalletBuySell', () ->
  () ->
    {
      exchanges:
        coinify: {
          getTrades: () ->
          fetchProfile: () ->
          getKYCs: () ->
          getBuyCurrencies: () ->
          monitorPayments: () ->
        }
    }
