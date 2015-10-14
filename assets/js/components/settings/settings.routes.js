angular
  .module('walletApp')
  .config(settingsRoutes);

function settingsRoutes($stateProvider) {
  $stateProvider.state("wallet.common.settings", {
    url: "/settings",
    views: {
      top: {
        templateUrl: "partials/top.jade",
        controller: "TopCtrl"
      },
      left: {
        templateUrl: "partials/wallet-navigation.jade",
        controller: "WalletNavigationCtrl"
      },
      right: {
        controller: "SettingsCtrl",
        templateUrl: "partials/settings/settings.jade"
      }
    }
  })
  .state("wallet.common.settings.info", {
    url: "/info",
    views: {
      settings: {
        templateUrl: "partials/settings/info.jade",
        controller: "SettingsInfoCtrl"
      }
    }
  })
  .state("wallet.common.settings.preferences", {
    url: "/preferences",
    views: {
      settings: {
        templateUrl: "partials/settings/preferences.jade",
        controller: "SettingsPreferencesCtrl"
      }
    }
  })
  .state("wallet.common.settings.security", {
    url: "/security",
    views: {
      settings: {
        templateUrl: "partials/settings/security.jade",
        controller: "SettingsSecurityCtrl"
      }
    }
  })
  .state("wallet.common.settings.accounts", {
    url: "/accounts",
    views: {
      settings: {
        templateUrl: "partials/settings/accounts.jade",
        controller: "SettingsAccountsController"
      }
    }
  })
  .state("wallet.common.settings.addresses", {
    url: "/addresses",
    views: {
      settings: {
        templateUrl: "partials/settings/addresses.jade",
        controller: "SettingsAddressesCtrl"
      }
    }
  })
  .state("wallet.common.settings.address", {
    url: "/addresses/:address",
    views: {
      settings: {
        templateUrl: "partials/settings/address.jade",
        controller: "AddressCtrl"
      }
    }
  })
  .state("wallet.common.settings.hd_address", {
    url: "/:account/addresses/:index",
    views: {
      settings: {
        templateUrl: "partials/settings/hd_address.jade",
        controller: "HDAddressCtrl"
      }
    }
  });
}
