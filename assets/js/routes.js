'use strict';

angular
  .module('walletApp')
  .config(AppRouter);

AppRouter.$inject = ['$stateProvider', '$urlRouterProvider'];

function AppRouter ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise(function ($injector, $location) {
    let Wallet = $injector.get('Wallet');
    return Wallet.status.isLoggedIn ? '/home' : '/';
  });

  $urlRouterProvider.when('/settings', '/settings/wallet');

  let top = {
    templateUrl: 'partials/top.jade',
    controller: 'TopCtrl'
  };

  let walletNav = {
    templateUrl: 'partials/wallet-navigation.jade',
    controller: 'WalletNavigationCtrl'
  };

  let commonViews = {
    navigation: {
      templateUrl: 'partials/navigation.jade',
      controller: 'NavigationCtrl'
    },
    common: {
      templateUrl: 'partials/common.jade'
    }
  };

  let transactionsViews = {
    top: top,
    left: walletNav,
    right: {
      templateUrl: 'partials/transactions.jade',
      controller: 'TransactionsCtrl'
    }
  };

  $stateProvider
    .state('wallet', {
      views: {
        body: {
          templateUrl: 'partials/wallet.jade'
        }
      }
    })
    .state('wallet.common', {
      views: commonViews
    });

  $stateProvider
    .state('welcome', {
      url: '/',
      views: {
        body: {
          templateUrl: 'partials/wallet-welcome.jade',
          controller: 'WelcomeCtrl'
        }
      },
      contents: {
        top: top
      }
    });

  $stateProvider
    .state('public', {
      views: {
        body: {
          templateUrl: 'partials/public.jade'
        }
      }
    })
    .state('public.login-no-uid', {
      url: '/login',
      views: {
        contents: {
          templateUrl: 'partials/login.jade',
          controller: 'LoginCtrl'
        }
      }
    })
    .state('public.login-uid', {
      url: '/login/:uid',
      views: {
        contents: {
          templateUrl: 'partials/login.jade',
          controller: 'LoginCtrl'
        }
      }
    })
    .state('public.signup', {
      url: '/signup',
      views: {
        contents: {
          templateUrl: 'partials/signup.jade',
          controller: 'SignupCtrl'
        }
      },
      params: {
        email: ''
      }
    })
    .state('public.help', {
      url: '/help',
      views: {
        contents: {
          templateUrl: 'partials/help.jade'
        }
      }
    })
    .state('public.recover', {
      url: '/recover',
      views: {
        contents: {
          templateUrl: 'partials/recover-funds.jade',
          controller: 'RecoverFundsCtrl'
        }
      }
    })
    .state('public.reminder', {
      url: '/reminder',
      views: {
        contents: {
          templateUrl: 'partials/lost-guid.jade',
          controller: 'LostGuidCtrl'
        }
      }
    })
    .state('public.reset-two-factor', {
      url: '/reset-2fa',
      views: {
        contents: {
          templateUrl: 'partials/reset-two-factor.jade',
          controller: 'ResetTwoFactorCtrl'
        }
      }
    })
    .state('public.authorize-approve', {
      url: '/authorize-approve/{token:.*}',
      views: {
        contents: {
          templateUrl: 'partials/authorize-approve.jade',
          controller: 'AuthorizeApproveCtrl'
        }
      }
    })
    .state('public.reset-two-factor-token', {
      url: '/reset-two-factor/{token:.*}',
      views: {
        contents: {
          templateUrl: 'partials/reset-two-factor-token.jade',
          controller: 'ResetTwoFactorTokenCtrl'
        }
      }
    })
    .state('signup.finish', {
      url: '/signup/finish',
      views: commonViews
    })
    .state('signup.finish.show', {
      views: transactionsViews
    });

  $stateProvider
    .state('wallet.common.home', {
      url: '/home',
      views: {
        top: top,
        left: {
          templateUrl: 'partials/wallet-navigation.jade',
          controller: 'WalletNavigationCtrl'
        },
        right: {
          templateUrl: 'partials/home.jade',
          controller: 'HomeCtrl'
        }
      }
    })
    .state('wallet.common.security-center', {
      url: '/security-center',
      views: {
        top: top,
        left: {
          templateUrl: 'partials/wallet-navigation.jade',
          controller: 'WalletNavigationCtrl'
        },
        right: {
          templateUrl: 'partials/security-center.jade',
          controller: 'SettingsSecurityCenterCtrl'
        }
      }
    })
    .state('wallet.common.transactions', {
      url: '/:accountIndex/transactions',
      views: transactionsViews
    })
    .state('wallet.common.open', {
      url: '/open/{uri:.*}',
      views: {
        top: {
          templateUrl: 'partials/open-link.jade',
          controller: 'OpenLinkController'
        }
      }
    })
    .state('wallet.common.claim', {
      url: '/claim/:code',
      views: {
        top: top,
        left: walletNav,
        right: {
          controller: 'ClaimCtrl'
        }
      }
    })
    .state('wallet.common.verify-email', {
      url: '/verify-email/{token:.*}',
      views: {
        top: top,
        left: walletNav,
        right: {
          controller: 'VerifyEmailCtrl'
        }
      }
    })
    .state('wallet.common.unsubscribe', {
      url: '/unsubscribe/{token:.*}',
      views: {
        top: top,
        left: walletNav,
        right: {
          controller: 'UnsubscribeCtrl'
        }
      }
    })
    .state('wallet.common.settings', {
      url: '/settings',
      views: {
        top: top,
        left: {
          templateUrl: 'partials/wallet-navigation.jade',
          controller: 'WalletNavigationCtrl'
        },
        right: {
          controller: 'SettingsCtrl',
          templateUrl: 'partials/settings/settings.jade'
        }
      }
    });

  $stateProvider
    .state('wallet.common.settings.info', {
      url: '/info',
      views: {
        settings: {
          templateUrl: 'partials/settings/info.jade',
          controller: 'SettingsInfoCtrl'
        }
      }
    })
    .state('wallet.common.settings.preferences', {
      url: '/preferences',
      views: {
        settings: {
          templateUrl: 'partials/settings/preferences.jade',
          controller: 'SettingsPreferencesCtrl'
        }
      }
    })
    .state('wallet.common.settings.security', {
      url: '/security',
      views: {
        settings: {
          templateUrl: 'partials/settings/security.jade',
          controller: 'SettingsSecurityCtrl'
        }
      }
    })
    .state('wallet.common.settings.accounts_index', {
      url: '/addresses',
      views: {
        settings: {
          templateUrl: 'partials/settings/accounts.jade',
          controller: 'SettingsAccountsController'
        }
      }
    })
    .state('wallet.common.settings.accounts_addresses', {
      url: '/:account/addresses',
      views: {
        settings: {
          templateUrl: 'partials/settings/addresses.jade',
          controller: 'SettingsAddressesCtrl'
        }
      }
    })
    .state('wallet.common.settings.imported_addresses', {
      url: '/imported-addresses',
      views: {
        settings: {
          templateUrl: 'partials/settings/imported-addresses.jade',
          controller: 'SettingsImportedAddressesCtrl'
        }
      }
    })
    .state('wallet.common.settings.address_book', {
      url: '/address-book',
      views: {
        settings: {
          templateUrl: 'partials/settings/address-book.jade',
          controller: 'SettingsAddressBookCtrl'
        }
      }
    });
}
