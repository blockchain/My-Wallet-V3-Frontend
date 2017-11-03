angular
  .module('walletApp')
  .controller('UnocoinTradeSummaryController', UnocoinTradeSummaryController);

function UnocoinTradeSummaryController ($scope, modals, $uibModalInstance, trade, state, formatTrade) {
  $scope.vm = { trade: trade };

  $scope.tradeIsPending = () => (
    $scope.vm.trade.state === 'awaiting_transfer_in' ||
    $scope.vm.trade.state === 'awaiting_reference_number'
  );

  $scope.formattedTrade = formatTrade[state || trade.state](trade);
  trade.state === 'cancelled' && ($scope.formattedTrade.namespace = 'UNOCOIN_TX_ERROR_STATE');

  $scope.editRef = () => {
    $scope.disableLink = true;
    modals.openBankTransfer(trade, 'reference');
    $uibModalInstance.dismiss();
  };
}
