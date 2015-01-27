walletApp.config ($stateProvider, $urlRouterProvider) ->
  $urlRouterProvider.otherwise("/");
  
  $urlRouterProvider.otherwise(($injector, $location) ->
    Wallet = $injector.get("Wallet")

    if Wallet.status.isLoggedIn == false
      $location = "/login"
    else
      $location = "/accounts/transactions"
  )

  alerts = {
    templateUrl: "partials/alerts.jade"
    controller: "AlertsCtrl"
  }
  
  top =  {
    templateUrl: "partials/top.jade"
    controller: "TopCtrl"
  }
  
  navigation =  {
    templateUrl: "partials/navigation.jade"
    controller: "NavigationCtrl"
  }
  
  accounts = { 
    templateUrl: "partials/accounts-navigation.jade"
    controller: "AccountsCtrl"
  }
  
  settingsNavigation = {
    templateUrl: "partials/settings/navigation.jade"
    controller: "SettingsNavigationCtrl"
  }

  $stateProvider.state("login",
    url: "/login"
    views: {
      navigation: navigation,
      alerts: alerts,
      top: top,
      right: {
        templateUrl: "partials/login.jade"
        controller: "LoginCtrl"
      }
    }
  )
  
  # $stateProvider.state("dashboard",
  #   url: "/"
  #   views: {
  #     navigation: navigation,
  #     alerts: alerts,
  #     top : top,
  #     left: accounts,
  #     right: {
  #       templateUrl: "partials/dashboard"
  #       controller: "DashboardCtrl"
  #     }
  #   }
  # )
  
  $stateProvider.state("transactions",
    url: "/:accountIndex/transactions/"
    views: {
      navigation: navigation,
      alerts: alerts,
      top: top,
      left: accounts,
      right: {
        templateUrl: "partials/transactions.jade"
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
        templateUrl: "partials/accounts-navigation.jade"
        controller: "AccountsCtrl"
      },
      right: {
        templateUrl: "partials/transaction.jade"
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
        templateUrl: "partials/settings/settings.jade"
      }
    }
  ) 
  .state("settings.my-details",
    url: "/my-details"
    views: {
      settings: {
        templateUrl: "partials/settings/my-details.jade"
        controller: "SettingsMyDetailsCtrl"
      }
    }
  )
  .state("settings.wallet",
    url: "/wallet"
    views: {
      settings: {
        templateUrl: "partials/settings/wallet.jade"
        controller: "SettingsWalletCtrl"
      }
    }
  )
  .state("settings.accounts",
    url: "/accounts"
    views: {
      settings: {
        templateUrl: "partials/settings/accounts.jade"
        controller: "SettingsAccountsCtrl"
      }
    }
  )
  .state("settings.mobile",
    url: "/mobile"
    views: {
      settings: {
        templateUrl: "partials/settings/mobile.jade"
        controller: "MobileCtrl"
      }
    }
  )
  .state("settings.addresses",
    url: "/addresses"
    views: {
      settings: {
        templateUrl: "partials/settings/addresses.jade"
        controller: "SettingsAddressesCtrl"
      }
    }
  )
  .state("settings.address",
    url: "/addresses/:address"
    views: {
      settings: {
        templateUrl: "partials/settings/address.jade"
        controller: "AddressCtrl"
      }
    }
  )
  .state("settings.security-center",
    url: "/security-center"
    views: {
      settings: {
        templateUrl: "partials/settings/security-center.jade"
        controller: "SettingsSecurityCenterCtrl"
      }
    }
  )
  .state("settings.wallet-recovery",
    url: "/wallet-recovery"
    views: {
      settings: {
        templateUrl: "partials/settings/wallet-recovery.jade"
        controller: "RecoveryCtrl"
      }
    }
  )
  .state("settings.advanced",
    url: "/advanced"
    views: {
      settings: {
        templateUrl: "partials/settings/advanced.jade"
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
        templateUrl: "partials/open-link.jade"
        controller: "OpenLinkController"
      }
    }
  )
  
  $stateProvider.state("claim",
    url: "/claim/:code"
      
    views: {
      navigation: navigation,
      alerts: alerts,
      top: {
        controller: "ClaimCtrl"
      }
    }
  )
  
  $stateProvider.state("verify-email-with-guid",
    url: "/verify-email/:code/:guid"
    onEnter: ($stateParams, $state, Wallet, $translate) ->
      # If the link target blockchain-...uid... was preserved and we are logged in on another tab,
      # then we are in the wrong process and there's no way to switch to the correct tab.
      # If however the target was not preserved, there's still a chance the user is logged in on 
      # another tab. We try to get them there and close the current tab. Unfortunately there's no
      # way of knowing without trying, so we may end up needlessly opening a new tab and closing this one.
      
      if !Wallet.status.isLoggedIn && window.name != "blockchain-" + $stateParams.guid
        Wallet.guid = $stateParams.guid
        href = "http://local.blockchain.com:8080/#/verify-email/" + $stateParams.code
        target= "blockchain-" + $stateParams.guid
        if window.open(href, target)
          window.close()
        
      Wallet.goal.verifyEmail = $stateParams.code
  )
  
  $stateProvider.state("verify-email",
    url: "/verify-email/:code"
    onEnter: ($stateParams, $state, Wallet, $translate) ->
      Wallet.goal.verifyEmail = $stateParams.code
  )
  