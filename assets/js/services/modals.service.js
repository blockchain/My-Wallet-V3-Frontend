angular
  .module('walletApp')
  .factory('modals', modals);

function modals ($state, $uibModal, $ocLazyLoad) {
  const service = {};

  let open = (defaults, options = {}) => (
    $uibModal.open(angular.merge(options, defaults))
  );

  service.openBankHelper = () => open({
    templateUrl: 'partials/bank-check-modal.jade',
    windowClass: 'bc-modal medium'
  });

  service.openDepositHelper = () => open({
    templateUrl: 'partials/bank-deposit-modal.jade',
    windowClass: 'bc-modal medium'
  });

  service.openTransfer = (addresses) => open({
    templateUrl: 'partials/settings/transfer.jade',
    controller: 'TransferController',
    windowClass: 'bc-modal',
    resolve: { address: () => addresses }
  }).result;

  service.expandTray = (options) => open({
    backdrop: false, windowClass: 'tray'
  }, options).result;

  service.openSfoxSignup = (exchange) => service.expandTray({
    templateUrl: 'partials/sfox/signup.jade',
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
  }).finally(() => {
    let base = 'wallet.common.buy-sell';
    let goingToBuySellState = $state.current.name.indexOf(base) === 0;
    if (goingToBuySellState) $state.go('wallet.common.buy-sell');
  });

  service.openTradeSummary = (trade, state) => open({
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
  });

  return service;
}
