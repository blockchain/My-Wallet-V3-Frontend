angular
  .module('walletApp.core')
  .factory('MyBlockchainApi', ($q) -> {
    getTicker: () ->
      then: (s) ->
        s({
          EUR: {"last": 250, symbol: "€"}
          USD: {"last": 300, symbol: "$"}
        })
        { catch: () -> }
  })
