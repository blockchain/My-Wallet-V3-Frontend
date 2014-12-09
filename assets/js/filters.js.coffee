"use strict"

angular.module("walletFilters", [])
      
.filter "btc", ->
  (input,hideCurrency) ->
    if input? && !isNaN(input) 
     numeral(input).divide(100000000).format("0.[00000000]") + (if hideCurrency then "" else " BTC")
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
.filter "highlight", ($sce) ->
  (text, phrase) ->
    text = text.replace(new RegExp("(" + phrase + ")", "gi"), "<span class=\"highlighted\">$1</span>")  if phrase
    $sce.trustAsHtml text
