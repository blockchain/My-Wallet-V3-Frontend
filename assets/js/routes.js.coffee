angular.module('walletApp').config ($stateProvider, $urlRouterProvider) ->

  $urlRouterProvider.otherwise("/")

  $urlRouterProvider.otherwise(($injector, $location) ->
    Wallet = $injector.get("Wallet")

    if Wallet.status.isLoggedIn == false
      $location = "/login"
    else
      $location = "/home"
  )

  $urlRouterProvider.when('/settings', '/settings/wallet')

  top =  {
    templateUrl: "partials/top.jade"
    controller: "TopCtrl"
  }

  walletNav = {
    templateUrl: "partials/wallet-navigation.jade"
    controller: "WalletNavigationCtrl"
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
    left: walletNav,
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
  .state("signup",
    views: {
      body: {
        templateUrl: "partials/signup.jade"
        controller: "SignupCtrl"
      }
    }
  )
  .state("recover",
    url: "/recover"
    views: {
      body: {
        templateUrl: "partials/recover-funds.jade"
        controller: "RecoverFundsCtrl"
      }
    }
  )
  # Use the same layout as the transactions screen, once signup is complete
  .state("signup.finish",
    url: "/signup/finish"
    views: commonViews
  )
  .state("signup.finish.show",
    views: transactionsViews
  )


  $stateProvider.state("wallet.common.home",
    url: "/home"
    views: {
      top : top,
      left: {
        templateUrl: "partials/wallet-navigation.jade"
        controller: "WalletNavigationCtrl"
      },
      right: {
        templateUrl: "partials/home.jade"
        controller: "HomeCtrl"
      }
    }
  )
  $stateProvider.state("wallet.common.support",
    url: "/contact-support"
    views: {
      top : top,
      left: {
        templateUrl: "partials/wallet-navigation.jade"
        controller: "WalletNavigationCtrl"
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
        templateUrl: "partials/wallet-navigation.jade"
        controller: "WalletNavigationCtrl"
      },
      right: {
        templateUrl: "partials/feedback.jade"
        controller: "FeedbackCtrl"
      }
    }
  )
  $stateProvider.state("wallet.common.security-center",
    url: "/security-center"
    views: {
      top: top,
      left: {
        templateUrl: "partials/wallet-navigation.jade"
        controller: "WalletNavigationCtrl"
      },
      right: {
        templateUrl: "partials/security-center.jade"
        controller: "SettingsSecurityCenterCtrl"
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
        templateUrl: "partials/wallet-navigation.jade"
        controller: "WalletNavigationCtrl"
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
      top: top,
      left: {
        templateUrl: "partials/wallet-navigation.jade"
        controller: "WalletNavigationCtrl"
      },
      right: {
        controller: "SettingsCtrl"
        templateUrl: "partials/settings/settings.jade"
      }
    }
  )
  .state("wallet.common.settings.info",
    url: "/info"
    views: {
      settings: {
        templateUrl: "partials/settings/info.jade"
        controller: "SettingsInfoCtrl"
      }
    }
  )
  .state("wallet.common.settings.preferences",
    url: "/preferences"
    views: {
      settings: {
        templateUrl: "partials/settings/preferences.jade"
        controller: "SettingsPreferencesCtrl"
      }
    }
  )
  .state("wallet.common.settings.security",
    url: "/security"
    views: {
      settings: {
        templateUrl: "partials/settings/security.jade"
        controller: "SettingsSecurityCtrl"
      }
    }
  )
  .state("wallet.common.settings.accounts_index",
    url: "/accounts"
    views: {
      settings: {
        templateUrl: "partials/settings/accounts.jade"
        controller: "SettingsAccountsController"
      }
    }
  )
  .state("wallet.common.settings.accounts_addresses",
    url: "/:account/addresses"
    views: {
      settings: {
        templateUrl: "partials/settings/addresses.jade"
        controller: "SettingsAddressesCtrl"
      }
    }
  )
  .state("wallet.common.settings.imported_addresses",
    url: "/imported-addresses"
    views: {
      settings: {
        templateUrl: "partials/settings/imported-addresses.jade"
        controller: "SettingsImportedAddressesCtrl"
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
      left: walletNav,
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
