angular
  .module('walletApp')
  .controller('RequestController', RequestController);

function RequestController ($scope, destination, assetContext) {
  let code = assetContext.isViewingBtc() && 'btc' ||
             assetContext.isViewingEth() && 'eth' ||
             assetContext.isViewingBch() && 'bch' ||
             'btc';

  this.destination = destination;
  this.asset = assetContext.getAssets().filter(a => a.code === code)[0];

  this.showTab = (asset) => this.asset = asset;
  this.onTab = (asset) => asset === this.asset.code;
}
