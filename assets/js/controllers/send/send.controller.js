angular
  .module('walletApp')
  .controller('SendController', SendController);

function SendController ($uibModalInstance, paymentRequest, asset, assetContext) {
  let code = asset.code ||
             assetContext.isViewingBtc() && 'btc' ||
             assetContext.isViewingEth() && 'eth' ||
             'btc';

  this.confirm = false;
  this.paymentRequest = paymentRequest;

  this.showTab = (asset) => this.asset = asset;
  this.onTab = (asset) => asset === this.asset.code;
  this.asset = asset.code ? asset : assetContext.getAssets().filter((a) => a.code === code)[0];

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
