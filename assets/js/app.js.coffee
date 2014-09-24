"use strict"

# App Module 
walletApp = angular.module("walletApp", [
  "controllers"
  "walletFilters"
  "walletServices"
  "ui.router"
  "ui.bootstrap"
])
walletApp.config ($stateProvider, $urlRouterProvider) ->
    $urlRouterProvider.otherwise("/");
    
    $stateProvider.state("dashboard",
      url: "/"
      templateUrl: "partials/dashboard"
      controller: "DashboardCtrl"
    )
    
    $stateProvider.state("transactions",
      url: "/transactions"
      templateUrl: "partials/wallet"
      controller: "WalletCtrl"
    )