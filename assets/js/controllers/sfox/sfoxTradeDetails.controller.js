angular
  .module('walletApp')
  .controller('SfoxTradeDetailsController', SfoxTradeDetailsController);

function SfoxTradeDetailsController ($scope, MyWallet, currency) {
  let trade = $scope.trade;
  let format = currency.formatCurrencyForView;
  let fiat = currency.currencies.find((c) => c.code === 'USD');
  let btc = currency.bitCurrencies.find((c) => c.code === 'BTC');
  let tx = MyWallet.wallet.txList.transactions(0).find((t) => t.hash === trade.txHash);

  $scope.namespace = 'SFOX';
  $scope.state = '.' + trade.state;
  $scope.type = trade.isBuy ? '.buy' : '.sell';
  $scope.rate = format(1 / trade.outAmount * trade.inAmount, fiat, true);

  $scope.tradeDetails = {
    txAmt: {
      key: '.AMT',
      val: format(currency.convertFromSatoshi(tx ? -tx.amount : 0, btc), btc, true)
    },
    txFee: {
      key: '.TX_FEE',
      val: format(currency.convertFromSatoshi(tx ? tx.fee : 0, btc), btc, true)
    },
    out: {
      key: '.TOTAL',
      val: format(trade.outAmount, btc, true)
    },
    in: {
      key: '.TO_BE_RECEIVED',
      val: format(trade.inAmount, fiat, true),
      tip: () => console.log('Clicked tooltip')
    }
  };
}
