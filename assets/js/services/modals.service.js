angular
  .module('walletApp')
  .factory('modals', modals);

function modals ($state, $uibModal, $ocLazyLoad) {
  const service = {};

  let open = (defaults, options = {}) => (
    $uibModal.open(angular.merge(options, defaults))
  );

  service.openOnce = (modalOpener) => {
    let modalInstance = null;
    return (...args) => {
      if (modalInstance) return;
      modalInstance = modalOpener(...args);
      modalInstance.result.finally(() => { modalInstance = null; });
    };
  };

  service.dismissPrevious = (modalOpener) => {
    let modalInstance = null;
    return (...args) => {
      if (modalInstance) modalInstance.dismiss('overridden');
      modalInstance = modalOpener(...args);
    };
  };

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
    templateUrl: 'partials/helper-modal.jade',
    windowClass: 'bc-modal medium'
  });

  service.openTemplate = (templateUrl, scope, options) => {
    open({
      templateUrl,
      controller ($scope) { angular.merge($scope, scope); }
    }, options).result;
  };

  service.openTransfer = (addresses) => open({
    templateUrl: 'partials/settings/transfer.jade',
    controller: 'TransferController',
    windowClass: 'bc-modal',
    resolve: { address: () => addresses }
  }).result;

  service.expandTray = (options) => open({
    backdrop: false, windowClass: 'tray'
  }, options).result;

  service.openSfoxSignup = (exchange, quote) => service.expandTray({
    templateUrl: 'partials/sfox/signup.jade',
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
  }).then(() => {
    $state.go('wallet.common.buy-sell.sfox', { selectedTab: 'ORDER_HISTORY' });
  }).catch(() => {
    let base = 'wallet.common.buy-sell';
    let goingToBuySellState = $state.current.name.indexOf(base) === 0;
    if (goingToBuySellState) $state.go('wallet.common.buy-sell');
  });

  service.openTradeSummary = service.dismissPrevious((trade, state) => open({
    templateUrl: 'partials/trade-modal.jade',
    windowClass: 'bc-modal trade-summary',
    controller ($scope, trade, formatTrade, accounts) {
      $scope.formattedTrade = formatTrade[state || trade.state](trade, accounts);
    },
    resolve: {
      trade: () => trade,
      accounts ($q, MyWallet) {
        let exchange = MyWallet.wallet.external.sfox;
        return exchange.hasAccount
          ? exchange.getBuyMethods().then(methods => methods.ach.getAccounts())
          : $q.resolve([]);
      }
    }
  }));

  return service;
}
