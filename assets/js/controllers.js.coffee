"use strict"

# Controllers 
walletControllers = angular.module("walletControllers", [])
walletControllers.controller "WalletCtrl", ($scope, Wallet) ->
  $scope.addresses = Wallet.addresses
  $scope.status = Wallet.status
  
  $scope.login = () ->
    Wallet.login($scope.uid, $scope.password)
