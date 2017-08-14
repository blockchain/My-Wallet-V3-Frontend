angular
  .module('walletApp')
  .directive('validateEthAddress', validateEthAddress);

function validateEthAddress ($q, Ethereum) {
  return {
    require: 'ngModel',
    link
  };

  function link (scope, element, attrs, ctrl) {
    ctrl.$validators.isEthAddress = (modelValue) => (
      modelValue && Ethereum.isAddress(modelValue)
    );

    ctrl.$asyncValidators.isContract = (modelValue) => (
      Ethereum.isContractAddress(modelValue)
        .then(isContract => isContract ? $q.reject() : $q.resolve())
    );
  }
}
