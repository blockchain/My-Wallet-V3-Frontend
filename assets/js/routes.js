'use strict';

angular
  .module('walletApp')
  .config(AppRouter);

AppRouter.$inject = ['$stateProvider', '$urlRouterProvider'];

function AppRouter ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise(function ($injector, $location) {
    if (!$injector.has('Wallet')) {
      return '/';
    } else {
      let Wallet = $injector.get('Wallet');
      if (!Wallet.status.isLoggedIn) {
        return '/';
      } else {
        return '/home';
      }
    }
  });

  $urlRouterProvider.when('/settings', '/settings/wallet');

  let top = {
    templateUrl: 'partials/top.pug',
    controller: 'TopCtrl'
  };

  let walletNav = {
    templateUrl: 'partials/wallet-navigation.pug',
    controller: 'WalletNavigationCtrl'
  };

  let commonViews = {
    navigation: {
      templateUrl: 'partials/navigation.pug',
      controller: 'NavigationCtrl'
    },
    common: {
      templateUrl: 'partials/common.pug'
    }
  };

  let transactionsViews = {
    top: top,
    left: walletNav,
    right: {
      templateUrl: 'partials/transactions.pug',
      controller: 'TransactionsCtrl'
    }
  };

  let loadWalletModule = ($ocLazyLoad) => (
    $ocLazyLoad.load('walletLazyLoad')
  );

  $stateProvider
    .state('wallet', {
      views: {
        body: {
          templateUrl: 'partials/wallet.pug',
          controller: 'WalletCtrl'
        }
      },
      resolve: {
        loadWalletModule
      }
    })
    .state('wallet.common', {
      views: commonViews
    });

  $stateProvider
    .state('intermediate', {
      url: '/intermediate',
      views: {
        body: {
          template: '<blocket-loading loading="true"></blocket-loading>',
          controller (buyMobile, Wallet) {
            if (!Wallet.status.isLoggedIn) {
              buyMobile.callMobileInterface(buyMobile.FRONTEND_INITIALIZED);
            }
          }
        }
      },
      resolve: {
        loadWalletModule
      }
    });

  $stateProvider
    .state('landing', {
      url: '/',
      views: {
        body: {
          templateUrl: 'landing.html',
          controller: 'LandingCtrl'
        }
      }
    })
    .state('public', {
      views: {
        body: {
          templateUrl: 'partials/public.pug',
          controller: function ($scope, $state, languages) {
            $scope.path = $state.current.url;
            $scope.languages = languages.languages;
            $scope.$watch(languages.get, (code) => {
              $scope.language = languages.mapCodeToName(code);
            });
          }
        }
      },
      resolve: {
        loadWalletModule
      }
    })
    .state('public.login-no-uid', {
      url: '/login',
      views: {
        contents: {
          templateUrl: 'partials/login.pug',
          controller: 'LoginCtrl'
        }
      }
    })
    .state('public.login-uid', {
      url: '/login/:uid',
      views: {
        contents: {
          templateUrl: 'partials/login.pug',
          controller: 'LoginCtrl'
        }
      }
    })
    .state('public.logout', {
      url: '/logout',
      views: {
        contents: {
          templateUrl: 'partials/logout.pug',
          controller: 'LogoutController'
        }
      }
    })
    .state('public.signup', {
      url: '/signup',
      views: {
        contents: {
          templateUrl: 'partials/signup.pug',
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
          templateUrl: 'partials/help.pug'
        }
      }
    })
    .state('public.recover', {
      url: '/recover',
      views: {
        contents: {
          templateUrl: 'partials/recover-funds.pug',
          controller: 'RecoverFundsCtrl'
        }
      }
    })
    .state('public.reminder', {
      url: '/reminder',
      views: {
        contents: {
          templateUrl: 'partials/lost-guid.pug',
          controller: 'LostGuidCtrl'
        }
      }
    })
    .state('public.reset-two-factor', {
      url: '/reset-2fa',
      views: {
        contents: {
          templateUrl: 'partials/reset-two-factor.pug',
          controller: 'ResetTwoFactorCtrl'
        }
      }
    })
    .state('public.authorize-approve', {
      url: '/authorize-approve/{token:.*}',
      views: {
        contents: {
          templateUrl: 'partials/authorize-approve.pug',
          controller: 'AuthorizeApproveCtrl'
        }
      }
    })
    .state('public.verify-email', {
      url: '/verify-email/{token:.*}',
      views: {
        contents: {
          controller: 'VerifyEmailCtrl',
          templateUrl: 'partials/verify-email.pug'
        }
      }
    })
    .state('public.reset-two-factor-token', {
      url: '/reset-two-factor/{token:.*}',
      views: {
        contents: {
          templateUrl: 'partials/reset-two-factor-token.pug',
          controller: 'ResetTwoFactorTokenCtrl'
        }
      }
    });

  $stateProvider
    .state('wallet.common.home', {
      url: '/home',
      views: {
        top: top,
        left: {
          templateUrl: 'partials/wallet-navigation.pug',
          controller: 'WalletNavigationCtrl'
        },
        right: {
          templateUrl: 'partials/home.pug',
          controller: 'HomeCtrl'
        }
      }
    })
    .state('wallet.common.security-center', {
      url: '/security-center',
      params: {
        promptBackup: ''
      },
      views: {
        top: top,
        left: walletNav,
        right: {
          templateUrl: 'partials/security-center.pug',
          controller: 'SettingsSecurityCenterCtrl',
          resolve: {
            loadBcPhoneNumber: ($ocLazyLoad) => {
              return $ocLazyLoad.load('bcPhoneNumber');
            }
          }
        }
      }
    })
    .state('wallet.common.transactions', {
      url: '/transactions',
      views: transactionsViews
    })
    .state('wallet.common.open', {
      url: '/open/{uri:.*}',
      views: {
        top: {
          templateUrl: 'partials/open-link.pug',
          controller: 'OpenLinkController'
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
        left: walletNav,
        right: {
          controller: 'SettingsCtrl',
          templateUrl: 'partials/settings/settings.pug'
        }
      }
    })
    .state('wallet.common.faq', {
      url: '/faq',
      views: {
        top: top,
        left: walletNav,
        right: {
          templateUrl: 'partials/faq.pug',
          controller: 'faqCtrl'
        }
      }
    });

  $stateProvider
    .state('wallet.common.buy-sell', {
      url: '/buy-sell',
      views: {
        top: top,
        left: walletNav,
        right: {
          templateUrl: 'partials/buy-sell-master.pug',
          controller: 'BuySellMasterController',
          controllerAs: 'vm'
        }
      }
    })
    .state('wallet.common.buy-sell.select', {
      templateUrl: 'partials/buy-sell-select-partner.pug',
      controller: 'BuySellSelectPartnerController',
      resolve: {
        options (Options) { return Options.get(); }
      }
    })
    .state('wallet.common.buy-sell.coinify', {
      templateUrl: 'partials/buy-sell.pug',
      controller: 'BuySellCtrl',
      params: { countryCode: null, selectedTab: 'BUY_BITCOIN' },
      resolve: {
        options (Options) { return Options.get(); }
      }
    })
    .state('wallet.common.buy-sell.sfox', {
      templateUrl: 'partials/sfox/checkout.pug',
      controller: 'SfoxCheckoutController',
      params: { selectedTab: null },
      resolve: {
        _loadBcPhoneNumber ($ocLazyLoad) {
          return $ocLazyLoad.load('bcPhoneNumber');
        },
        // Using Options.get is a hack to prevent route error while waiting for sfox api key
        _loadExchangeData ($q, MyWallet, sfox, Options) {
          let exchange = MyWallet.wallet.external.sfox;
          return exchange.user && !exchange.profile
            ? Options.get().then(() => sfox.fetchExchangeData(exchange))
            : $q.resolve();
        },
        accounts ($q, MyWallet, Options) {
          let exchange = MyWallet.wallet.external.sfox;
          return exchange.hasAccount
            ? Options.get().then(() => exchange.getBuyMethods()).then(methods => methods.ach.getAccounts())
            : $q.resolve([]);
        },
        options (Options) { return Options.get(); },
        showCheckout (options, MyWallet) {
          let email = MyWallet.wallet.accountInfo.email;
          let fraction = options.partners.sfox.showCheckoutFraction;

          return Blockchain.Helpers.isEmailInvited(email, fraction);
        }
      },
      onEnter ($state, $stateParams, MyWallet, modals, showCheckout) {
        let exchange = MyWallet.wallet.external.sfox;

        if (exchange.profile == null && !showCheckout) {
          $state.transition = null; // hack to prevent transition
          modals.openSfoxSignup(exchange);
        }
      }
    });

  $stateProvider
    .state('wallet.common.settings.info', {
      url: '/info',
      views: {
        settings: {
          templateUrl: 'partials/settings/info.pug',
          controller: 'SettingsInfoCtrl'
        }
      }
    })
    .state('wallet.common.settings.preferences', {
      url: '/preferences',
      views: {
        settings: {
          templateUrl: 'partials/settings/preferences.pug',
          controller: 'SettingsPreferencesCtrl'
        }
      },
      resolve: {
        loadBcPhoneNumber: ($ocLazyLoad) => {
          return $ocLazyLoad.load('bcPhoneNumber');
        }
      }
    })
    .state('wallet.common.settings.security', {
      url: '/security',
      views: {
        settings: {
          templateUrl: 'partials/settings/security.pug',
          controller: 'SettingsSecurityCtrl'
        }
      }
    })
    .state('wallet.common.settings.accounts_index', {
      url: '/addresses',
      views: {
        settings: {
          templateUrl: 'partials/settings/accounts.pug',
          controller: 'SettingsAccountsController'
        }
      }
    })
    .state('wallet.common.settings.accounts_addresses', {
      url: '/:account/addresses',
      views: {
        settings: {
          templateUrl: 'partials/settings/addresses.pug',
          controller: 'SettingsAddressesCtrl'
        }
      }
    })
    .state('wallet.common.settings.address_book', {
      url: '/address-book',
      views: {
        settings: {
          templateUrl: 'partials/settings/address-book.pug',
          controller: 'SettingsAddressBookCtrl'
        }
      }
    });
}
