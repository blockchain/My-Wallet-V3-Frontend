angular
  .module('walletApp')
  .controller('CoinifyISXController', CoinifyISXController);

function CoinifyISXController ($scope) {
  console.log($scope.vm.trade);
}
