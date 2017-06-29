angular
  .module('walletApp')
  .controller('RequestController', RequestController);

function RequestController ($scope, destination) {
  this.destination = destination;
  this.tab = 'btc';

  this.showTab = (tab) => {
    this.tab = tab;
  };

  this.onTab = (tab) => {
    return tab === this.tab;
  };
}
