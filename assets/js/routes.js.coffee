walletApp.config ($stateProvider, $urlRouterProvider) ->

  $urlRouterProvider.otherwise("/")
  
  $urlRouterProvider.otherwise(($injector, $location) ->
    Wallet = $injector.get("Wallet")

    if Wallet.status.isLoggedIn == false
      $location = "/login"
    else
      $location = "/accounts/transactions"
  )
  
  top =  {
    templateUrl: "partials/top.jade"
    controller: "TopCtrl"
  }
    
  accounts = { 
    templateUrl: "partials/accounts-navigation.jade"
    controller: "AccountsCtrl"
  }
  
  commonViews = {
    navigation:  {
      templateUrl: "partials/navigation.jade"
      controller: "NavigationCtrl"
    },
    alerts: {
      templateUrl: "partials/alerts.jade"
      controller: "AlertsCtrl"
    }
    common: {
      templateUrl: "partials/common.jade"
    }
  }
  
  transactionsViews = {
    top: top,
    left: accounts,
    right: {
      templateUrl: "partials/transactions.jade"
      controller: "TransactionsCtrl"
    }
  }

  $stateProvider.state("wallet",
    views: {
      body: {
        templateUrl: "partials/wallet.jade"
      }
    }
  )
  .state("wallet.common",
    views: commonViews
  )
  .state("login",
    views: {
      body: {
        templateUrl: "partials/login.jade"
        controller: "LoginCtrl"
      }
    }
  )
  .state("login.show",
    url: "/login"
    views: {
      alerts: {
        templateUrl: "partials/alerts.jade"
        controller: "AlertsCtrl"
      }
    }
  )
  .state("register",
    url: "/register"
    views: {
      body: {
        templateUrl: "partials/register.jade"
        controller: "RegistrationCtrl"
      }
    }
  )
  
  # Use the same layout as the transactions screen, once signup is complete
  .state("register.finish", 
    url: "/register/finish"
    views: commonViews
  )
  .state("register.finish.show",
    views: transactionsViews
  )
  
  
  $stateProvider.state("wallet.common.dashboard",
    url: "/dashboard"
    views: {
      top : top,
      left: {
        templateUrl: "partials/accounts-navigation.jade"
        controller: "AccountsCtrl"
      },
      right: {
        templateUrl: "partials/dashboard.jade"
        controller: "DashboardCtrl"
      }
    }
  )
  $stateProvider.state("wallet.common.support",
    url: "/contact-support"
    views: {
      top : top,
      left: {
        templateUrl: "partials/accounts-navigation.jade"
        controller: "AccountsCtrl"
      },
      right: {
        templateUrl: "partials/support.jade"
        controller: ($scope, $log, $state) -> 
          $scope.state = $state
      }
    }
  )
  $stateProvider.state("wallet.common.feedback",
    url: "/feedback"
    views: {
      top : top,
      left: {
        templateUrl: "partials/accounts-navigation.jade"
        controller: "AccountsCtrl"
      },
      right: {
        templateUrl: "partials/feedback.jade"
        controller: "FeedbackCtrl"
      }
    }
  )

  $stateProvider.state("wallet.common.transactions",
    url: "/:accountIndex/transactions/"
    views: transactionsViews
  )

  $stateProvider.state("wallet.common.transaction",
    url: "/:accountIndex/transactions/:hash"
    views: {
      top : top,
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

  $stateProvider.state("wallet.common.settings",
    url: "/settings"
    views: {
      left: {
        templateUrl: "partials/settings/navigation.jade"
        controller: "SettingsNavigationCtrl"
      }
      right: {
        controller: "SettingsCtrl"
        templateUrl: "partials/settings/settings.jade"
      }
    }
  )
  .state("wallet.common.settings.my-details",
    url: "/my-details"
    views: {
      settings: {
        templateUrl: "partials/settings/my-details.jade"
        controller: "SettingsMyDetailsCtrl"
      }
    }
  )
  .state("wallet.common.settings.wallet",
    url: "/wallet"
    views: {
      settings: {
        templateUrl: "partials/settings/wallet.jade"
        controller: "SettingsWalletCtrl"
      }
    }
  )
  .state("wallet.common.settings.accounts",
    url: "/accounts"
    views: {
      settings: {
        templateUrl: "partials/settings/accounts.jade"
        controller: "SettingsAccountsCtrl"
      }
    }
  )
  .state("wallet.common.settings.mobile",
    url: "/mobile"
    views: {
      settings: {
        templateUrl: "partials/settings/mobile.jade"
        controller: "MobileCtrl"
      }
    }
  )
  .state("wallet.common.settings.addresses",
    url: "/addresses"
    views: {
      settings: {
        templateUrl: "partials/settings/addresses.jade"
        controller: "SettingsAddressesCtrl"
      }
    }
  )
  .state("wallet.common.settings.address",
    url: "/addresses/:address"
    views: {
      settings: {
        templateUrl: "partials/settings/address.jade"
        controller: "AddressCtrl"
      }
    }
  )
  .state("wallet.common.settings.security-center",
    url: "/security-center"
    views: {
      settings: {
        templateUrl: "partials/settings/security-center.jade"
        controller: "SettingsSecurityCenterCtrl"
      }
    }
  )
  .state("wallet.common.settings.wallet-recovery",
    url: "/wallet-recovery"
    views: {
      settings: {
        templateUrl: "partials/settings/wallet-recovery.jade"
        controller: "RecoveryCtrl"
      }
    }
  )
  .state("wallet.common.settings.advanced",
    url: "/advanced"
    views: {
      settings: {
        templateUrl: "partials/settings/advanced.jade"
        controller: "SettingsAdvancedCtrl"
      }
    }
  )

  $stateProvider.state("wallet.common.open",
    url: "/open/{uri:.*}"

    views: {
      top: {
        templateUrl: "partials/open-link.jade"
        controller: "OpenLinkController"
      }
    }
  )

  $stateProvider.state("wallet.common.claim",
    url: "/claim/:code"

    views: {
      top: top,
      left: accounts,
      right: {
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
  
