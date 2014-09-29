"use strict"

# App Module 
walletApp = angular.module("walletApp", [
  "walletFilters"
  "walletServices"
  "ui.router"
  "ui.bootstrap"
  "ngCookies"
  "myWalletServices"
])
walletApp.config ($stateProvider, $urlRouterProvider) ->
    $urlRouterProvider.otherwise("/");
    
    $stateProvider.state("dashboard",
      url: "/"
      views: {
        "left" : {
          templateUrl: "partials/addresses"
          controller: "AddressesCtrl"
        },
        "right": { 
          templateUrl: "partials/dashboard"
          controller: "DashboardCtrl"
        }
      }
    )
    
    $stateProvider.state("transactions",
      url: "/transactions"
      views: {
        "left" : {
          templateUrl: "partials/addresses"
          controller: "AddressesCtrl"
        },
        right: {
          templateUrl: "partials/transactions"
          controller: "TransactionsCtrl"
        }
      }

    )