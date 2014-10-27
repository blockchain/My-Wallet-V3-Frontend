"use strict"

# Filters 
angular.module("walletFilters", []).filter "fiat", ->
  (input, currency) ->
    if input != undefined && input != null && currency.conversion != undefined && currency.conversion > 0
      if currency
        currency.symbol + input.clone().divide(currency.conversion).format("0.00") + " " + currency.code
      else
        input.clone().divide(100000000).format("0.[00000000]") + " BTC"
    else
      ""
      
.filter "btc", ->
  (input) ->
    if input && !isNaN(input.value()) 
     input.clone().divide(100000000).format("0.[00000000]") + " BTC"
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

.filter "getByProperty", ->
  (propertyName, propertyValue, collection) ->
    i = 0
    len = collection.length
    while i < len
      return collection[i]  if collection[i][propertyName] == propertyValue
      i++
    null
