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
  "ngSanitize"
  "ja.qr"
  "webcam"
])

walletApp.config (uiSelectConfig) ->
  uiSelectConfig.theme = 'bootstrap';
    
walletApp.config ($stateProvider, $urlRouterProvider) ->
    $urlRouterProvider.otherwise("/");

    accounts = {
      templateUrl: "partials/accounts"
      controller: "AccountsCtrl"
    }
    

    paymentRequests = {
      templateUrl: "partials/payment-requests"
      controller: "PaymentRequestsCtrl"
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
        "accounts" : accounts,
        "payment-requests" : paymentRequests,
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
        "accounts" : accounts,
        "payment-requests" : paymentRequests,
        right: {
          templateUrl: "partials/transactions"
          controller: "TransactionsCtrl"
        }
      }

    )