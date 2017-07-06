angular
  .module('walletApp')
  .controller('RequestController', RequestController);

function RequestController ($scope, destination) {
  this.destination = destination;

  this.asset = { name: 'Bitcoin', code: 'btc', icon: 'icon-bitcoin' };
  this.showTab = (asset) => this.asset = asset;
  this.onTab = (asset) => asset === this.asset.code;

  this.btcRequestStep = 0;
}
