"use strict"

# Controllers 
controllers = angular.module("controllers", [])



controllers.controller "WalletCtrl", ($scope, Wallet, $state, $cookies) ->
  $scope.addresses = Wallet.addresses
  $scope.transactions = Wallet.transactions
  $scope.status    = Wallet.status
  $scope.settings = Wallet.settings
  $scope.totals = Wallet.totals
  
  # Restore after browser refresh
  if !$scope.status.isLoggedIn 
    if !!$cookies.password
      # TODO: don't use the password to restore a session
      Wallet.login($cookies.uid, $cookies.password)
    else
      $state.go("dashboard")
  
  $scope.generateAddress = () ->
    Wallet.generateAddress()


    
controllers.controller "DashboardCtrl", ($scope, $log, Wallet, $cookies) ->
  $scope.status = Wallet.status    
  $scope.uid = $cookies.uid

  if !$scope.status.isLoggedIn && !!$cookies.password
    # TODO: don't use the password to restore a session
    Wallet.login($cookies.uid, $cookies.password)
  
  $scope.login = () ->
    Wallet.login($scope.uid, $scope.password)
    $cookies.uid = $scope.uid
    # Temporary solution: we should not store the password
    $cookies.password = $scope.password
    
  $scope.logout = () ->
    $scope.uid = null
    $scope.password = null
    delete $cookies.password
    delete $cookies.uid
    Wallet.logout()