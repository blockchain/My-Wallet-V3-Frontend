angular.module("myBlockchainApiServices", []).factory "MyBlockchainApi", () ->
    {
      get_ticker: (success, fail) ->
          success({
            EUR: {"last": 250, symbol: "€"}
            USD: {"last": 300, symbol: "$"}
          })
    }