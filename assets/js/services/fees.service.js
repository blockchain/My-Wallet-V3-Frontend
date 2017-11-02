angular
  .module('walletApp')
  .factory('fees', fees);

function fees ($uibModal) {
  const standardTx = 512;
  const service = {
    showLargeTxWarning
  };
  return service;

  function showLargeTxWarning (txSize, recommendedFee) {
    let multiplier = (txSize / standardTx).toFixed(1);
    let modalOptions = {
      templateUrl: 'partials/large-tx.pug',
      windowClass: 'bc-modal medium',
      controller: ($scope) => angular.extend($scope, { multiplier, recommendedFee })
    };
    return $uibModal.open(modalOptions).result;
  }
}
