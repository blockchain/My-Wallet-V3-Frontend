angular
  .module('walletApp')
  .controller('SendController', SendController);

function SendController ($uibModalInstance, paymentRequest, assetContext) {
  this.confirm = false;
  this.paymentRequest = paymentRequest;

  this.asset = { name: 'Bitcoin', code: 'btc', icon: 'icon-bitcoin' };
  this.showTab = (asset) => this.asset = asset;
  this.onTab = (asset) => asset === this.asset.code;

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

  this.context = assetContext.getContext();
  if (this.context.defaultTo === 'eth') this.asset = assetContext.getAssets().filter(a => a.code === 'eth')[0];
  if (this.context.available.length === 1) this.hideAssetSelect = true;
}