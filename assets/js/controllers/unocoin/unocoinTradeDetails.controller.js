angular
  .module('walletApp')
  .controller('UnocoinTradeDetailsController', UnocoinTradeDetailsController);

function UnocoinTradeDetailsController ($scope, $uibModalStack, MyWallet, currency, modals, unocoin, Exchange) {
  let trade = $scope.trade;
  $scope.tradeIsPending = () => (trade.state === 'awaiting_transfer_in' || trade.state === 'awaiting_reference_number');

  $scope.namespace = 'UNOCOIN';
  $scope.state = '.' + trade.state;
  $scope.type = trade.isBuy ? '.buy' : '.sell';
  $scope.classHelper = Exchange.classHelper;

  $scope.tradeDetails = unocoin.buyTradeDetails(trade);

  $scope.values = {
    'email': MyWallet.wallet.accountInfo.email,
    'label': MyWallet.wallet.hdwallet.defaultAccount.label
  };

  $scope.editRef = () => {
    $scope.disableLink = true;
    modals.openBankTransfer(trade, 'reference');
    $uibModalStack.dismissAll();
  };
}
