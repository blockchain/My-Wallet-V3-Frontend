angular
  .module('walletApp')
  .controller('UnocoinTradeDetailsController', UnocoinTradeDetailsController);

function UnocoinTradeDetailsController ($scope, $uibModalInstance, MyWallet, currency, modals) {
  let trade = $scope.trade;
  $scope.tradeIsPending = () => (trade.state === 'awaiting_transfer_in' || trade.state === 'awaiting_reference_number');

  let format = currency.formatCurrencyForView;
  let fiat = currency.currencies.find((c) => c.code === 'INR');
  let btc = currency.bitCurrencies.find((c) => c.code === 'BTC');

  $scope.namespace = 'UNOCOIN';
  $scope.state = '.' + trade.state;
  $scope.type = trade.isBuy ? '.buy' : '.sell';
  $scope.rate = format(1 / trade.outAmount * trade.inAmount, fiat, true);

  $scope.tradeDetails = {
    id: {
      key: '.ID',
      val: '#' + trade.id
    },
    date: {
      key: '.DATE',
      val: new Date(trade.createdAt).toLocaleString()
    },
    in: {
      key: '.TOTAL',
      val: format(currency.convertFromSatoshi(trade.outAmountExpected, btc), btc, true)
    },
    out: {
      key: '.TOTAL_COST',
      val: format(trade.inAmount, fiat, true),
      tip: () => console.log('Clicked tooltip')
    }
  };

  $scope.values = {
    'email': MyWallet.wallet.accountInfo.email,
    'label': MyWallet.wallet.hdwallet.defaultAccount.label
  };

  $scope.editRef = () => {
    $scope.disableLink = true;
    modals.openBankTransfer(trade, 'reference');
    $uibModalInstance.dismiss();
  };
}
