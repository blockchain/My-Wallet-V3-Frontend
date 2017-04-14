angular
  .module('walletApp')
  .controller('CoinifyTradeSummaryController', CoinifyTradeSummaryController);

function CoinifyTradeSummaryController ($scope, formatTrade) {
  let trade = $scope.vm.trade;
  let state = trade.medium === 'bank' ? 'bank_transfer' : trade.state;

  // This needs improvement
  // formatTrade(trade) should handle any possible completed trade state from Coinify || IST.
  $scope.formattedTrade = formatTrade[state](trade);
}
