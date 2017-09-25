angular.module('walletApp.core').factory('MyWalletBuySell', () =>
  () =>
    ({
      exchanges: {
        coinify: {
          api: {},
          getTrades () {},
          fetchProfile () {},
          getBuyCurrencies () {},
          monitorPayments () {}
        },
        sfox: {
          api: {}
        }
      }
    })
);
