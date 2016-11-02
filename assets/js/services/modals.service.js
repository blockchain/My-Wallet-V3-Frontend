angular
  .module('walletApp')
  .factory('modals', modals);

function modals ($state, $uibModal, $ocLazyLoad) {
  const service = {};

  let open = (defaults, options = {}) => (
    $uibModal.open(angular.merge(options, defaults))
  );

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
      exchange () { return exchange; }
    }
  }).finally(() => {
    let base = 'wallet.common.buy-sell';
    let goingToBuySellState = $state.current.name.indexOf(base) === 0;
    if (goingToBuySellState) $state.go('wallet.common.buy-sell');
  });

  return service;
}
