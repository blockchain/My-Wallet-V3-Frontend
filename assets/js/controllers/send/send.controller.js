angular
  .module('walletApp')
  .controller('SendController', SendController);

function SendController ($uibModalInstance, paymentRequest) {
  this.confirm = false;
  this.tab = 'btc';
  this.paymentRequest = paymentRequest;

  this.showTab = (tab) => {
    this.tab = tab;
  };

  this.onTab = (tab) => {
    return tab === this.tab;
  };

  this.close = (result) => {
    $uibModalInstance.close(result);
  };

  this.dismiss = (reason) => {
    $uibModalInstance.dismiss(reason);
  };

  this.toSendView = () => {
    this.confirm = false;
  };

  this.toConfirmView = () => {
    this.confirm = true;
  };
}
