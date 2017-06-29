angular
  .module('walletApp')
  .controller('RequestController', RequestController);

function RequestController ($scope, destination) {
  this.destination = destination;
}
