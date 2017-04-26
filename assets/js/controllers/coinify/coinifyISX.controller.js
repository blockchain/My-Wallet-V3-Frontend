angular
  .module('walletApp')
  .controller('CoinifyISXController', CoinifyISXController);

function CoinifyISXController ($scope, formatTrade) {
  let trade = $scope.vm.trade;
  trade.medium === 'bank' && $scope.vm.goTo('trade-complete');
  $scope.onComplete = (state) => {
    $scope.vm.completedState = state;
    $scope.vm.goTo('trade-complete');
  };
}
