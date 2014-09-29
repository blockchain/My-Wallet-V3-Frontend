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
    
    left = {
      templateUrl: "partials/addresses"
      controller: "AddressesCtrl"
    }
    
    top =  {
      templateUrl: "partials/top"
      controller: "TopCtrl"
    }
    
    $stateProvider.state("dashboard",
      url: "/"
      views: {
        "top"  : top,
        "left" : left,
        "right": { 
          templateUrl: "partials/dashboard"
          controller: "DashboardCtrl"
        }
      }
    )
    
    $stateProvider.state("transactions",
      url: "/transactions"
      views: {
        "top"  : top,
        "left" : left,
        right: {
          templateUrl: "partials/transactions"
          controller: "TransactionsCtrl"
        }
      }

    )