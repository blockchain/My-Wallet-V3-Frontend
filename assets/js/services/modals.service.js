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

  service.openRequest = service.openOnce((destination = null) =>
    open({
      templateUrl: 'partials/request/request.pug',
      windowClass: 'bc-modal initial',
      controller: 'RequestController',
      controllerAs: 'vm',
      resolve: {
        destination: () => destination,
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
        'id-id-helper': 'img/id-id-helper.png',
        'bank-check-helper': 'img/bank-check-helper.png',
        'address-id-helper': 'img/address-id-helper.png',
        'bank-deposit-helper': 'img/bank-deposit-helper.png',
        'unocoin_photo-id-helper': 'img/unocoin-photo-id-helper.png',
        'unocoin_address-id-helper': 'img/unocoin-address-id-helper.png',
        'unocoin_pancard-id-helper': 'img/unocoin-pancard-id-helper.png',
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

  service.openTradeSummary = service.dismissPrevious((trade, state) => {
    let accounts = ($q, MyWallet) => {
      let exchange = MyWallet.wallet.external.sfox;
      return exchange.hasAccount
        ? exchange.getBuyMethods().then(methods => methods.ach.getAccounts())
        : $q.resolve([]);
    };
    return openMobileCompatible({
      templateUrl: 'partials/trade-summary.pug',
      windowClass: 'bc-modal trade-summary',
      controller ($scope, MyWallet, trade, formatTrade, accounts, $uibModalInstance, $timeout) {
        let unocoin = $scope.unocoin = MyWallet.wallet.external.unocoin.hasAccount;

        $scope.vm = {
          trade: trade
        };

        $scope.tradeIsPending = () => (
          $scope.vm.trade.state === 'awaiting_transfer_in' ||
          $scope.vm.trade.state === 'awaiting_reference_number'
        );

        $scope.formattedTrade = formatTrade[state || trade.state](trade, accounts);
        unocoin && trade.state === 'cancelled' && ($scope.formattedTrade.namespace = 'UNOCOIN_TX_ERROR_STATE');
        $scope.editRef = () => {
          $scope.disableLink = true;
          service.openBankTransfer(trade, 'reference');
          $timeout(() => { $uibModalInstance.dismiss(); }, 1500);
        };
      },
      resolve: {
        trade: () => trade,
        accounts
      }
    });
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
        trade () { return trade; }
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

  service.openExchange = service.openOnce((asset) => {
    return openMobileCompatible({
      templateUrl: 'partials/shapeshift/modal.pug',
      controller: 'ShapeShiftModalController',
      controllerAs: 'vm',
      windowClass: 'bc-modal buy',
      backdrop: 'static',
      keyboard: false,
      resolve: {
        asset: () => asset
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
      controller: function ($scope, $uibModalInstance) {
        $scope.trade = trade;
        $scope.onClose = () => $uibModalInstance.dismiss();
      }
    });
  });

  service.openEthLogin = service.openOnce(() => {
    return openMobileCompatible({
      windowClass: 'bc-modal buy',
      templateUrl: 'partials/first-login-modal-eth.pug'
    });
  });

  service.openBitcoinCashAbout = service.openOnce(step => {
    return openMobileCompatible({
      templateUrl: 'partials/bitcoin-cash-about-modal.pug',
      controller: 'BitcoinCashAboutController',
      controllerAs: 'vm',
      windowClass: 'bc-modal buy',
      backdrop: 'static',
      keyboard: false
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

  return service;
}
