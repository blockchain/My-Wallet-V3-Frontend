walletApp.config ($stateProvider, $urlRouterProvider) ->
  $urlRouterProvider.otherwise("/");

  alerts = {
    templateUrl: "partials/alerts"
    controller: "AlertsCtrl"
  }
  
  top =  {
    templateUrl: "partials/top"
    controller: "TopCtrl"
  }
  
  navigation =  {
    templateUrl: "partials/navigation"
    controller: "NavigationCtrl"
  }
  
  accounts = { 
    templateUrl: "partials/accounts-navigation"
    controller: "AccountsCtrl"
  }
  
  settingsNavigation = {
    templateUrl: "partials/settings/navigation"
    controller: "SettingsNavigationCtrl"
  }

  $stateProvider.state("login",
    url: "/login"
    views: {
      navigation: navigation,
      alerts: alerts,
      top: top,
      right: {
        templateUrl: "partials/login"
        controller: "LoginCtrl"
      }
    }
  )
  
  $stateProvider.state("dashboard",
    url: "/"
    views: {
      navigation: navigation,
      alerts: alerts,
      top : top,
      left: accounts,
      right: { 
        templateUrl: "partials/dashboard"
        controller: "DashboardCtrl"
      }
    }
  )
  
  $stateProvider.state("transactions",
    url: "/:accountIndex/transactions/"
    views: {
      navigation: navigation,
      alerts: alerts,
      top: top,
      left: accounts,
      right: {
        templateUrl: "partials/transactions"
        controller: "TransactionsCtrl"
      }
    }
  )
  
  $stateProvider.state("transaction",
    url: "/:accountIndex/transactions/:hash"
    views: {
      navigation: navigation,
      alerts: alerts,
      left: { 
        templateUrl: "partials/accounts-navigation"
        controller: "AccountsCtrl"
      },
      right: {
        templateUrl: "partials/transaction"
        controller: "TransactionCtrl"
      }
    }
  )
  
  $stateProvider.state("settings",  
    url: "/settings"
    views: {
      navigation: navigation,
      alerts: alerts,
      left: settingsNavigation
      right: {
        controller: "SettingsCtrl"
        templateUrl: "partials/settings/settings"
      }
    }
  ) 
  .state("settings.my-details",
    url: "/my-details"
    views: {
      settings: {
        templateUrl: "partials/settings/my-details"
        controller: "SettingsMyDetailsCtrl"
      }
    }
  )
  .state("settings.wallet",
    url: "/wallet"
    views: {
      settings: {
        templateUrl: "partials/settings/wallet"
        controller: "SettingsWalletCtrl"
      }
    }
  )
  .state("settings.accounts",
    url: "/accounts"
    views: {
      settings: {
        templateUrl: "partials/settings/accounts"
        controller: "SettingsAccountsCtrl"
      }
    }
  )
  .state("settings.mobile",
    url: "/mobile"
    views: {
      settings: {
        templateUrl: "partials/settings/mobile"
        controller: "MobileCtrl"
      }
    }
  )
  .state("settings.addresses",
    url: "/addresses"
    views: {
      settings: {
        templateUrl: "partials/settings/addresses"
        controller: "SettingsAddressesCtrl"
      }
    }
  )
  .state("settings.security-center",
    url: "/security-center"
    views: {
      settings: {
        templateUrl: "partials/settings/security-center"
        controller: "SettingsSecurityCenterCtrl"
      }
    }
  )
  .state("settings.wallet-recovery",
    url: "/wallet-recovery"
    views: {
      settings: {
        templateUrl: "partials/settings/wallet-recovery"
        controller: "RecoveryCtrl"
      }
    }
  )
  .state("settings.advanced",
    url: "/advanced"
    views: {
      settings: {
        templateUrl: "partials/settings/advanced"
        controller: "SettingsAdvancedCtrl"
      }
    }
  )
  
  $stateProvider.state("open",
    url: "/open/:uri"
      
    views: {
      navigation: navigation,
      alerts: alerts,
      top: {
        templateUrl: "partials/open-link"
        controller: "OpenLinkController"
      }
    }
  )
  