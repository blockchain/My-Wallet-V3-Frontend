"use strict"

# Filters 

# Not used:
angular.module("walletFilters", []).filter "checkmark", ->
  (input) ->
    (if input then "✓" else "✘")