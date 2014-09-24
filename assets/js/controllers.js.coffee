"use strict"

# Controllers 
controllers = angular.module("controllers", [])

controllers.controller "WalletCtrl", ($scope, Wallet, $state) ->
  $scope.addresses = Wallet.addresses
  $scope.status    = Wallet.status
  
  unless Wallet.status.isLoggedIn
    $state.go("dashboard")
  
  $scope.generateAddress = () ->
    Wallet.generateAddress()
    
controllers.controller "DashboardCtrl", ($scope, $log, Wallet) ->
  $scope.status    = Wallet.status    
  
  $scope.login = () ->
    Wallet.login($scope.uid, $scope.password)