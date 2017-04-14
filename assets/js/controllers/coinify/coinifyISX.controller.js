angular
  .module('walletApp')
  .controller('CoinifyISXController', CoinifyISXController);

function CoinifyISXController ($scope) {
  let trade = $scope.vm.trade;
  trade.medium === 'bank' && $scope.vm.goTo('trade-complete');
}
