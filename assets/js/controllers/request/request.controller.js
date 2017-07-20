angular
  .module('walletApp')
  .controller('RequestController', RequestController);

function RequestController ($scope, destination, assetContext) {
  this.destination = destination;

  this.asset = { name: 'Bitcoin', code: 'btc', icon: 'icon-bitcoin' };

  this.showTab = (asset) => this.asset = asset;
  this.onTab = (asset) => asset === this.asset.code;

  this.context = assetContext.getContext();
  if (this.context.defaultTo === 'eth') this.asset = assetContext.getAssets().filter(a => a.code === 'eth')[0];
  if (this.context.available.length === 1) this.hideAssetSelect = true;
}
