angular
  .module('walletApp')
  .controller('SfoxTradeSummaryController', SfoxTradeSummaryController);

function SfoxTradeSummaryController ($scope, trade, state, formatTrade, sfoxAccounts) {
  $scope.vm = {
    trade: trade
  };

  $scope.formattedTrade = formatTrade[state || trade.state](trade, sfoxAccounts);
}
