angular
  .module('walletApp')
  .controller('CoinifyTradeSummaryController', CoinifyTradeSummaryController);

function CoinifyTradeSummaryController ($scope, $q, formatTrade) {
  let { trade } = $scope.vm;
  let completedState = $scope.vm.completedState || trade.state;
  $scope.formattedTrade = formatTrade[completedState](trade);

  $scope.fakeBankTransfer = () => {
    $q.resolve(trade.fakeBankTransfer())
      .then($scope.formattedTrade = formatTrade['processing'](trade));
  };
}
