"use strict"

##################
# MyWallet hacks #
##################

# Avoid lazy loading (complicates asset management)
loadScript = (src, success, error) ->
  success()

# App Module 
walletApp = angular.module("walletApp", [
  "walletFilters"
  "walletServices"
  "ui.router"
  "ui.bootstrap"
  "ngCookies"
  "myWalletServices"
  "ui.select"
])

walletApp.config (uiSelectConfig) ->
  uiSelectConfig.theme = 'bootstrap';

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