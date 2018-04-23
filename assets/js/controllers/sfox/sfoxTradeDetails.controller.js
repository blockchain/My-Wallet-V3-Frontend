angular
  .module('walletApp')
  .controller('SfoxTradeDetailsController', SfoxTradeDetailsController);

function SfoxTradeDetailsController ($scope, MyWallet, Exchange, currency, sfox, $q) {
  let trade = $scope.$parent.trade || $scope.checkout.trade || $scope.trade;
  let format = currency.formatCurrencyForView;
  let fiat = currency.currencies.find((c) => c.code === 'USD');
  let tx = MyWallet.wallet.txList.transactions(0).find((t) => t.hash === trade.txHash);
  if (!tx && !trade.isBuy) { tx = MyWallet.wallet.txList.transactions()[0]; }
  // TODO change the above, since buy won't have a tx hash
  $scope.classHelper = Exchange.classHelper;

  $scope.tradeId = trade.id;
  $scope.tradeAccount = sfox.accounts[0];
  $scope.namespace = 'SFOX';
  $scope.state = '.' + trade.state;
  $scope.type = trade.isBuy ? '.buy' : '.sell';

  let expectedDelivery;
  if ($scope.checkout && $scope.checkout.expectedDelivery) {
    expectedDelivery = new Date($scope.checkout.expectedDelivery).toDateString()
  } else {
    expectedDelivery = new Date(trade.expectedDelivery).toDateString()
  }

  if ($scope.type === '.buy') {
    $q.resolve(sfox.buyTradeDetails(null, trade, tx, expectedDelivery))
      .then(details => $scope.tradeDetails = details);
  } else {
    $scope.tradeDetails = sfox.sellTradeDetails(null, null, trade, tx, expectedDelivery);
  }

  $scope.rate = $scope.type === '.buy'
    ? format(((trade.sendAmount / 1e8) - trade.feeAmount) / trade.receiveAmount, fiat, true)
    : format(1 / (trade.sendAmount / 1e8) * (trade.receiveAmount + trade.feeAmount), fiat, true);
}
