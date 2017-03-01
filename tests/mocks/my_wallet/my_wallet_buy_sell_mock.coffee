angular.module('walletApp.core').factory 'MyWalletBuySell', () ->
  () ->
    {
      exchanges:
        coinify: {
          api: {}
          getTrades: () ->
          fetchProfile: () ->
          getKYCs: () ->
          getBuyCurrencies: () ->
          monitorPayments: () ->
        }
        sfox: {
          api: {}
        }
    }
