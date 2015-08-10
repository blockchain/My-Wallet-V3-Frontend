"use strict"

angular.module("walletFilters", [])

.filter "toBitCurrency", ->
  (input, btcCurrency, hideCurrency) ->
    if input? && !isNaN(input) && btcCurrency? && btcCurrency.code? && btcCurrency.conversion?
      format = "0.[" + btcCurrency.conversion.toString().substr(1) + "]"
      numeral(input).divide(btcCurrency.conversion).format(format) + (if hideCurrency then "" else (" " + btcCurrency.code))
    else
      ""

.filter "btc", ->
  (input,hideCurrency) ->
    if input? && !isNaN(input)
     numeral(input).divide(100000000).format("0.[00000000]") + (if hideCurrency then "" else " BTC")
    else
      ""

# converts a satoshi amount into the current display currency
# name is purposfully not very descriptive to save memory in cookie storage
.filter "convert", ["Wallet", (Wallet) ->
  (amount) ->
    currency = Wallet.settings.displayCurrency
    conversion = Wallet.convertFromSatoshi(amount, currency)
    Wallet.formatCurrencyForView(conversion, currency)
]

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

.filter "getByPropertyNested", ->
  (propertyName, propertyValue, collection) ->
    i = 0
    len = collection.length
    while i < len
      subCollection = collection[i][propertyName]
      j = 0
      len2 = subCollection.length
      while j < len2
        return collection[i]  if collection[i][propertyName][j] == propertyValue
        j++
      i++
    null

.filter "addressOrNameMatch", ->
  (addresses, q) ->
    return addresses if !q? or q == ""
    q = q.toLowerCase()
    addresses.filter (addr) ->
      keep = addr.account? && addr.account.label.toLowerCase().indexOf(q) > -1
      keep = keep || addr.label? && addr.label.toLowerCase().indexOf(q) > -1
      keep = keep || addr.address.toLowerCase().indexOf(q) > -1
      return keep
