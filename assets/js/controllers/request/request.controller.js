angular
  .module('walletApp')
  .controller('RequestController', RequestController);

function RequestController ($scope, destination) {
  this.destination = destination;
  this.assets = [
    {name: 'Bitcoin', code: 'btc', icon: 'icon-bitcoin'},
    {name: 'Ether', code: 'eth', icon: 'icon-ethereum'}
  ];

  this.asset = this.assets.find(a => a.code === 'btc');

  this.showTab = (tab) => this.asset = tab;

  this.onTab = (tab) => tab === this.asset.code;

  this.btcRequestStep = 0;
}
