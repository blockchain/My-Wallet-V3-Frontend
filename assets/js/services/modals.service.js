angular
  .module('walletApp')
  .factory('modals', modals);

function modals ($uibModal, $ocLazyLoad) {
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

  return service;
}
