"use strict"

# App Module 
walletApp = angular.module("walletApp", [
  "ngRoute"
  "walletControllers"
  "walletFilters"
  "walletServices"
])
walletApp.config [
  "$routeProvider"
  ($routeProvider) ->
    $routeProvider.when("/",
      templateUrl: "partials/wallet"
      controller: "WalletCtrl"
    ).otherwise redirectTo: "/"
]