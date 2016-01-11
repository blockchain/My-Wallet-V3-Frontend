angular
  .module('walletApp.core')
  .factory('MyBlockchainApi', ($q) -> {
    getTicker: () ->
      result =
        EUR: {"last": 250, symbol: "€"}
        USD: {"last": 300, symbol: "$"}
      $q.resolve(result)
    getFiatAtTime: (time, amount, currency) ->
      $q.resolve(amount.toFixed(2))
  })
