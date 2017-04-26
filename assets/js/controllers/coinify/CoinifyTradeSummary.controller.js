angular
  .module('walletApp')
  .controller('CoinifyTradeSummaryController', CoinifyTradeSummaryController);

function CoinifyTradeSummaryController ($scope, formatTrade) {
  let { trade } = $scope.vm;
  let completedState = $scope.vm.completedState || trade.state;
  $scope.formattedTrade = formatTrade[completedState](trade);
}
