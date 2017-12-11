angular
  .module('walletApp')
  .controller('RequestController', RequestController);

function RequestController ($scope, destination, asset, assetContext) {
  let code = asset && asset.code || assetContext.activeAsset() || 'btc';

  this.destination = destination;
  this.asset = assetContext.getAssets().filter(a => a.code === code)[0];

  this.showTab = (asset) => this.asset = asset;
  this.onTab = (asset) => asset === this.asset.code;
}
