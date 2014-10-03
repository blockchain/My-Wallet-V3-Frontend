"use strict"

# App Module 
walletApp = angular.module("walletApp", [
  "walletFilters"
  "walletServices"
  "ui.router"
  "ui.bootstrap"
  "ngCookies"
  "myWalletServices"
  "ui.select"
  "ngAudio"
])

walletApp.config (uiSelectConfig) ->
  uiSelectConfig.theme = 'bootstrap';

walletApp.config ($stateProvider, $urlRouterProvider) ->
    $urlRouterProvider.otherwise("/");
    
    left = {
      templateUrl: "partials/accounts"
      controller: "AccountsCtrl"
    }
    
    top =  {
      templateUrl: "partials/top"
      controller: "TopCtrl"
    }
    
    navigation =  {
      templateUrl: "partials/navigation"
      controller: "NavigationCtrl"
    }
    
    $stateProvider.state("dashboard",
      url: "/"
      views: {
        "navigation" : navigation,
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
        "navigation" : navigation,
        "top"  : top,
        "left" : left,
        right: {
          templateUrl: "partials/transactions"
          controller: "TransactionsCtrl"
        }
      }

    )