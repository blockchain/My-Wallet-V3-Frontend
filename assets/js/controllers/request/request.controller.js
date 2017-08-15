angular
  .module('walletApp')
  .controller('RequestController', RequestController);

function RequestController ($scope, destination, asset, assetContext) {
  this.destination = destination;

  let assetCode = (asset && ['btc', 'eth'].indexOf(asset)) ? asset : 'btc';
  this.asset = assetContext.getAssets().filter(a => a.code === assetCode)[0];

  this.showTab = (asset) => this.asset = asset;
  this.onTab = (asset) => asset === this.asset.code;
}
