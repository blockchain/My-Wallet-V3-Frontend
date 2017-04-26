angular
  .module('walletApp')
  .controller('CoinifyTradeSummaryController', CoinifyTradeSummaryController);

function CoinifyTradeSummaryController ($scope, $q, formatTrade) {
  let { trade, buySellDebug } = $scope.vm;
  let completedState = $scope.vm.completedState || trade.state;
  $scope.formattedTrade = formatTrade[completedState](trade);

  $scope.fakeBankTransfer = () => {
    $q.resolve(trade.fakeBankTransfer())
      .then(() => trade.refresh())
      .then((trade) => $scope.vm.trade = trade)
      .then($scope.formattedTrade = formatTrade['processing']($scope.vm.trade));
  };

  if (buySellDebug) {
    console.log('this.watchAddress() for', $scope.trade);
  }

  $q.resolve(trade.watchAddress())
    .then(() => trade.refresh())
    .then((trade) => $scope.vm.trade = trade)
    .then(() => $scope.formattedTrade = formatTrade['success']($scope.vm.trade));
}
