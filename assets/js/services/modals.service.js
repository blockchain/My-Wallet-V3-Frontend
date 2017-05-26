angular
  .module('walletApp')
  .factory('modals', modals);

function modals ($rootScope, $state, $uibModal, $ocLazyLoad) {
  const service = {};

  let open = (defaults, options = {}) => {
    return $uibModal.open(angular.merge(options, defaults));
  };

  let openMobileCompatible = (config) => (
    ($rootScope.inMobileBuy ? service.expandTray : open)(config)
  );

  service.openOnce = (modalOpener) => {
    let modalInstance = null;
    return (...args) => {
      if (modalInstance) return;
      modalInstance = modalOpener(...args);
      modalInstance.result.finally(() => { modalInstance = null; });
      return modalInstance;
    };
  };

  service.dismissPrevious = (modalOpener) => {
    let modalInstance = null;
    return (...args) => {
      if (modalInstance) modalInstance.dismiss('overridden');
      modalInstance = modalOpener(...args);
      return modalInstance;
    };
  };

  service.openSend = service.openOnce((paymentRequest = {}, options) =>
    open({
      templateUrl: 'partials/send.pug',
      windowClass: 'bc-modal initial',
      controller: 'SendCtrl',
      resolve: {
        paymentRequest: () => paymentRequest,
        loadBcQrReader: () => $ocLazyLoad.load('bcQrReader')
      }
    }, options)
  );

  service.openHelper = (helper) => open({
    controller ($scope) {
      let helperImages = {
        'bank-deposit-helper': 'img/bank-deposit-helper.png',
        'bank-check-helper': 'img/bank-check-helper.png',
        'address-id-helper': 'img/address-id-helper.png',
        'id-id-helper': 'img/id-id-helper.png'
      };

      $scope.helper = helper;
      $scope.image = helperImages[helper];
    },
    templateUrl: 'partials/helper-modal.pug',
    windowClass: 'bc-modal medium'
  });

  service.openFullScreen = (templateUrl, controller) => open({
    templateUrl,
    controller,
    windowClass: 'modal-fullscreen',
    backdrop: 'static',
    keyboard: false
  });

  service.openTemplate = (templateUrl, scope, options) => {
    return openMobileCompatible(angular.merge({
      templateUrl,
      controller ($scope) { angular.merge($scope, scope); }
    }, options)).result;
  };

  service.openTransfer = (addresses) => open({
    templateUrl: 'partials/settings/transfer.pug',
    controller: 'TransferController',
    windowClass: 'bc-modal',
    resolve: { address: () => addresses }
  }).result;

  service.expandTray = (options) => open({
    backdrop: false, windowClass: 'tray'
  }, options);

  service.openSfoxSignup = (exchange, quote) => service.expandTray({
    templateUrl: 'partials/sfox/signup.pug',
    controllerAs: 'vm',
    controller: 'SfoxSignupController',
    resolve: {
      exchange () { return exchange; },
      quote () { return quote; },
      accounts: ($q) => {
        return exchange.profile
          ? exchange.getBuyMethods().then(methods => methods.ach.getAccounts())
          : $q.resolve([]);
      }
    }
  }).result.then(() => {
    $state.go('wallet.common.buy-sell.sfox', { selectedTab: 'ORDER_HISTORY' });
  }).catch(() => {
    let base = 'wallet.common.buy-sell';
    let goingToBuySellState = $state.current.name.indexOf(base) === 0;
    if (goingToBuySellState) $state.go('wallet.common.buy-sell');
  });

  service.openTradeSummary = service.dismissPrevious((trade, state) => {
    let accounts = ($q, MyWallet) => {
      let exchange = MyWallet.wallet.external.sfox;
      return exchange.hasAccount
        ? exchange.getBuyMethods().then(methods => methods.ach.getAccounts())
        : $q.resolve([]);
    };
    return openMobileCompatible({
      templateUrl: 'partials/trade-modal.pug',
      windowClass: 'bc-modal trade-summary',
      controller ($scope, trade, formatTrade, accounts) {
        $scope.formattedTrade = formatTrade[state || trade.state](trade, accounts);
      },
      resolve: {
        trade: () => trade,
        accounts
      }
    });
  });

  service.openBuyView = service.openOnce((quote, trade) => {
    return openMobileCompatible({
      templateUrl: 'partials/coinify-modal.pug',
      controller: 'CoinifyController',
      controllerAs: 'vm',
      windowClass: 'bc-modal buy',
      backdrop: 'static',
      keyboard: false,
      resolve: {
        quote () { return quote; },
        trade () { return trade; },
        paymentMediums () { return quote && quote.getPaymentMediums(); }
      }
    });
  });

  return service;
}
