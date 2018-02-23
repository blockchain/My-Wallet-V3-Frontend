angular
  .module('walletApp')
  .factory('modals', modals);

function modals ($rootScope, $state, $uibModal, $ocLazyLoad, MyWallet) {
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

  service.openSend = service.openOnce((paymentRequest = {}, asset = {}, options) =>
    open({
      templateUrl: 'partials/send/send.pug',
      windowClass: 'bc-modal initial',
      controller: 'SendController',
      controllerAs: 'vm',
      resolve: {
        asset: () => asset,
        paymentRequest: () => paymentRequest,
        loadBcQrReader: () => $ocLazyLoad.load('bcQrReader'),
        _initialize ($q, Ethereum) {
          return Ethereum.userHasAccess
            ? Ethereum.initialize()
            : $q.resolve();
        }
      }
    }, options)
  );

  service.openRequest = service.openOnce((destination = null, asset = null) =>
    open({
      templateUrl: 'partials/request/request.pug',
      windowClass: 'bc-modal initial',
      controller: 'RequestController',
      controllerAs: 'vm',
      resolve: {
        destination: () => destination,
        asset: () => asset,
        _initialize ($q, Ethereum) {
          return Ethereum.userHasAccess
            ? Ethereum.initialize()
            : $q.resolve();
        }
      }
    })
  );

  service.openHelper = (helper, opts) => open({
    controller ($scope) {
      let helperImages = {
        'SFOX.HELPER.id': 'img/id-helper.png',
        'SFOX.HELPER.address': 'img/address-id-helper.png',
        'UNOCOIN.HELPER.photo': 'img/unocoin-photo-id-helper.png',
        'UNOCOIN.HELPER.address': 'img/unocoin-address-id-helper.png',
        'UNOCOIN.HELPER.pancard': 'img/unocoin-pancard-id-helper.png',
        'bank-check-helper': 'img/bank-check-helper.png',
        'bank-deposit-helper': 'img/bank-deposit-helper.png',
        'expiring-exchange-helper': null,
        'coinify_after-trade': null
      };

      $scope.helper = helper;
      $scope.days = opts && opts.days;
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

  service.openSfoxSignup = (exchange) => service.expandTray({
    templateUrl: 'partials/sfox/signup.pug',
    controllerAs: 'vm',
    controller: 'SfoxSignupController',
    resolve: {
      exchange () { return exchange; },
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

  service.openUnocoinSignup = (exchange, quote) => service.expandTray({
    templateUrl: 'partials/unocoin/signup.pug',
    controllerAs: 'vm',
    controller: 'UnocoinSignupController',
    resolve: {
      exchange () { return exchange; },
      quote () { return quote; }
    }
  }).result.then(() => {
    $state.go('wallet.common.buy-sell.unocoin');
  }).catch(() => {
    let base = 'wallet.common.buy-sell';
    let goingToBuySellState = $state.current.name.indexOf(base) === 0;
    if (goingToBuySellState) $state.go('wallet.common.buy-sell');
  });

  service.openTradeDetails = service.dismissPrevious((trade, state) => {
    let exchange = MyWallet.wallet.external.hasExchangeAccount;
    let templates = { 'sfox': 'partials/sfox/details.pug', 'unocoin': 'partials/unocoin/details.pug' };

    /* Coinify is still using buyView */
    if (exchange === 'coinify') {
      return service.openBuyView(null, trade);
    } else {
      return openMobileCompatible({
        windowClass: 'bc-modal trade-summary',
        templateUrl: templates[exchange],
        controller: function ($scope, trade, state, sfoxAccounts) {
          $scope.trade = trade;
          $scope.state = state;
          $scope.sfoxAccounts = sfoxAccounts;
        },
        resolve: {
          trade () { return trade; },
          state () { return state; },
          sfoxAccounts ($q, sfox) {
            return sfox.exchange.hasAccount
              ? sfox.exchange.getBuyMethods().then(methods => methods.ach.getAccounts())
              : $q.resolve([]);
          }
        }
      });
    }
  });

  service.openBankTransfer = service.dismissPrevious((trade, step) => {
    return openMobileCompatible({
      templateUrl: 'partials/unocoin/bank-transfer.pug',
      windowClass: 'bc-modal trade-summary',
      controller: 'UnocoinBankTransferController',
      controllerAs: 'vm',
      resolve: {
        trade () { return trade; },
        bankAccount () { return trade.getBankAccountDetails(); },
        step () { return step; }
      }
    });
  });

  service.openBuyView = service.openOnce((quote, trade, frequency, endTime) => {
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
        endTime () { return endTime; },
        frequency () { return frequency; },
        mediums () {
          if (quote) {
            return quote.getPaymentMediums().then(mediums => mediums);
          }
        }
      }
    });
  });

  service.openSellView = service.openOnce((quote, trade) => {
    return openMobileCompatible({
      templateUrl: 'partials/coinify-sell-modal.pug',
      windowClass: 'bc-modal buy',
      controller: 'CoinifySellController',
      controllerAs: 'vm',
      backdrop: 'static',
      keyboard: false,
      resolve: {
        accounts ($q, MyWallet) {
          let coinify = MyWallet.wallet.external.coinify;
          return coinify.user && quote
            ? quote.getPaymentMediums().then((medium) => medium.bank.getBankAccounts())
            : $q.resolve([]);
        },
        quote () { return quote; },
        trade () { return trade; }
      }
    });
  });

  service.openShiftTradeDetails = service.openOnce((trade) => {
    return openMobileCompatible({
      controllerAs: 'vm',
      windowClass: 'buy',
      template: `
        <div class='pv-30'>
          <shift-receipt shift='trade' on-close="onClose()"></shift-receipt>
        </div>`,
      controller: function ($scope, $uibModalInstance, $state) {
        $scope.trade = trade;
        $scope.onClose = () => {
          $uibModalInstance.dismiss();
          $state.go('wallet.common.shift', {selectedTab: 'ORDER_HISTORY'});
        };
      }
    });
  });

  service.openAnnouncement = service.openOnce((namespace, link, fn) => {
    return openMobileCompatible({
      windowClass: 'bc-modal buy',
      templateUrl: 'partials/login-modal-announcement.pug',
      controller: function ($scope, $state, $uibModalInstance, ShapeShift) {
        $scope.namespace = namespace;

        $scope.cta = () => {
          $uibModalInstance.dismiss();
          link ? $state.go(link) : fn;
        };
      }
    });
  });

  service.openEthLegacyTransition = service.openOnce(() =>
    open({
      templateUrl: 'partials/eth-legacy-transition.pug',
      controller: 'EthLegacyTransitionController',
      windowClass: 'bc-modal prio initial',
      controllerAs: 'vm',
      backdrop: 'static',
      keyboard: false
    })
  );

  service.showMewSweep = service.openOnce(() =>
    open({
      templateUrl: 'partials/eth-mew-sweep.pug',
      controller: 'EthMewSweepController',
      windowClass: 'bc-modal initial'
    })
  );

  service.openSubscribe = service.openOnce(() =>
    open({
      templateUrl: 'partials/subscribe-modal.pug',
      windowClass: 'bc-modal initial',
      controller: 'SubscribeCtrl'
    })
  );

  return service;
}
