"use strict"

# Services 
walletServices = angular.module("walletServices", ["ngResource"])
walletServices.factory "Wallet", [
  "$resource"
  ($resource) ->
    return {}
]