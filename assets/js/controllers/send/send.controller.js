angular
  .module('walletApp')
  .controller('SendController', SendController);

function SendController ($uibModalInstance, paymentRequest) {
  this.paymentRequest = paymentRequest;

  this.close = (result) => {
    $uibModalInstance.close(result);
  };

  this.dismiss = (reason) => {
    $uibModalInstance.dismiss(reason);
  };
}
