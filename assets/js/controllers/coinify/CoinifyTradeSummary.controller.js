angular
  .module('walletApp')
  .controller('CoinifyTradeSummaryController', CoinifyTradeSummaryController);

function CoinifyTradeSummaryController ($scope, formatTrade) {
  let trade = $scope.vm.trade;

  // This needs improvement
  // formatTrade(trade) should handle any possible completed trade state from Coinify || IST.
  $scope.formattedTrade = formatTrade[trade.state](trade);
}
