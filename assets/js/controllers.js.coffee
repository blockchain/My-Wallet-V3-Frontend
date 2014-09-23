"use strict"

# Controllers 
walletControllers = angular.module("walletControllers", [])
walletControllers.controller "WalletCtrl", [
  "$scope"
  ($scope) ->
    $scope.hello = "world"
]