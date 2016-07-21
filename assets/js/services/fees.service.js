
angular
  .module('walletApp')
  .factory('fees', fees);

function fees ($uibModal) {
  const standardTx = 512;
  const service = {
    showFeeWarning: showFeeWarning,
    showLargeTxWarning: showLargeTxWarning
  };
  return service;

  function showFeeWarning (currentFee, suggestedFee, maxFee, surge) {
    let modalOptions = {
      templateUrl: 'partials/dynamic-fee.jade',
      windowClass: 'bc-modal medium',
      resolve: { feeValues: () => ({
        currentFee, suggestedFee, maxFee, surge
      }) },
      controller: 'DynamicFeeController'
    };
    return $uibModal.open(modalOptions).result;
  }

  function showLargeTxWarning (txSize, recommendedFee) {
    let multiplier = (txSize / standardTx).toFixed(1);
    let modalOptions = {
      templateUrl: 'partials/large-tx.jade',
      windowClass: 'bc-modal medium',
      controller: ($scope) => angular.extend($scope, { multiplier, recommendedFee })
    };
    return $uibModal.open(modalOptions).result;
  }
}
