angular
  .module('walletApp')
  .controller('CoinifyTradeSummaryController', CoinifyTradeSummaryController);

function CoinifyTradeSummaryController ($scope, $q, formatTrade, currency) {
  let { trade } = $scope.vm;
  $scope.trade = trade;
  $scope.dollars = currency.currencies.filter(c => c.code === trade.inCurrency)[0];
  let completedState = $scope.vm.completedState || trade.state;
  $scope.formattedTrade = formatTrade[completedState](trade);

  $scope.isPendingBankTransfer = () => trade.state === 'awaiting_transfer_in' && trade.medium === 'bank';

  $scope.fakeBankTransfer = () => {
    $q.resolve(trade.fakeBankTransfer())
      .then(() => trade.refresh())
      .then((trade) => $scope.vm.trade = trade)
      .then($scope.formattedTrade = formatTrade['processing']($scope.vm.trade));
  };

  if (trade.watchAddress) {
    $q.resolve(trade.watchAddress())
    .then(() => trade.refresh())
    .then((trade) => $scope.vm.trade = trade)
    .then(() => $scope.formattedTrade = formatTrade['success']($scope.vm.trade));
  }
}
