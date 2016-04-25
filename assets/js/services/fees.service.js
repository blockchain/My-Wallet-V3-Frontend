
angular
  .module('walletApp')
  .factory('fees', fees);

function fees ($uibModal) {
  const service = {
    showFeeWarning: showFeeWarning
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
}
