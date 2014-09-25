"use strict"

# Filters 

# Not used:
angular.module("walletFilters", []).filter "fiat", ->
  (input, currency) ->
    if input
      if currency
        currency.symbol + (input / currency.conversion).toFixed(2) + " " + currency.code
      else
        (input / 100000000).toFixed(8) + " BTC"
    else
      ""
      
.filter "btc", ->
  (input) ->
    if input
     (input / 100000000).toFixed(8) + " BTC"
    else
      ""
