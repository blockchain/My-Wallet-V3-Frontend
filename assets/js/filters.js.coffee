"use strict"

# Filters 
angular.module("walletFilters", []).filter "fiat", ->
  (input, currency) ->
    if input != undefined
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
#
# .filter "currentRequests", ->
#   (items) ->
#     console.log "Items:"
#     console.log items
#     return items.filter((item) ->
#       return item.complete == false && !item.canceled
#     )