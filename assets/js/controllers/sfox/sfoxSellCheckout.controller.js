angular
  .module('walletApp')
  .controller('SfoxSellCheckoutController', SfoxSellCheckoutController);

function SfoxSellCheckoutController ($scope, $timeout, $stateParams, $q, Wallet, MyWalletHelpers, Exchange, Alerts, currency, modals, sfox, $rootScope, buyMobile, localStorageService, MyWallet, Env) {
  let exchange = $scope.checkout.exchange;
  let enableSiftScience = () => $q.resolve($scope.siftScienceEnabled = true);

  $scope.selling = sfox.selling;
  $scope.sellQuoteHandler = sfox.fetchSellQuote.bind(null, exchange);

  $scope.checkout.sellHandler = (quote) => sfox.sell($scope.checkout.state.account, quote)
    .then(submitTx)
    .then(recordNote)
    .then($scope.checkout.fetchTransactions)
    .then(enableSiftScience)
    .then(() => exchange.fetchProfile())
    .then(() => Wallet.api.incrementPartnerTrade('sfox', 'sell', 'btc', 'usd', true))
    .catch((e) => Alerts.displayError(e));

  const setRate = (res) => { $scope.rate = Math.abs(res.quoteAmount); };
  $scope.getRate = () => $scope.sellQuoteHandler(1e8, 'BTC', $scope.checkout.dollars.code).then(setRate);
  $scope.getRate().then(() => sfox.setSellMin($scope.sellLimits($scope.rate).min));

  $scope.updateRate = (quote) => $scope.rate = quote.rate;

  $scope.sellLimits = (rate) => {
    return {
      min: parseFloat((10 / rate).toFixed(8)),
      max: parseFloat(Math.min(sfox.profile.limits.sell / rate, Exchange.sellMax).toFixed(8))
    };
  };

  $scope.buildPayment = (quote) => {
    let amt = quote.baseCurrency === 'BTC' ? quote.baseAmount : quote.quoteAmount;

    $scope.payment = Wallet.my.wallet.createPayment();
    $scope.payment.amount(amt);
    $scope.payment.updateFeePerKb(Exchange.sellFee || 2);
    $scope.payment.from(Wallet.my.wallet.hdwallet.defaultAccountIndex);
    let minutesInADay = 1440;
    let profile = exchange.profile;
    let expectedDelivery = profile.processingTimes && profile.processingTimes.usd.sell / minutesInADay + ' Days';

    $scope.payment.sideEffect((payment) => {
      $scope.checkout.quote = quote;
      $scope.checkout.type = 'sell';
      $scope.checkout.goTo('confirm');
      $scope.checkout.tradeDetails = sfox.sellTradeDetails($scope.checkout.quote, payment, null, null, expectedDelivery);
      Wallet.api.incrementPartnerTrade('sfox', 'sell', $scope.checkout.quote.baseCurrency, $scope.checkout.quote.quoteCurrency);
    });

    return quote;
  };

  $scope.checkout.sellRefresh = () => {
    let { baseAmount, quoteAmount, baseCurrency } = $scope.checkout.quote;
    let btc = baseCurrency === 'BTC' ? baseAmount : quoteAmount;
    return $q.resolve($scope.sellQuoteHandler(btc, $scope.checkout.bitcoin.code, $scope.checkout.dollars.code).then($scope.buildPayment).then($scope.updateRate));
  };

  let submitTx = (trade) => {
    $scope.checkout.trade = trade;
    $scope.checkout.expectedDelivery = trade.expectedDelivery;
    $scope.payment.to(trade.receiveAddress);
    return Wallet.askForSecondPasswordIfNeeded().then((pw) => {
      return $scope.payment.build().sign(pw).publish().payment;
    });
  };

  const recordNote = (tx) => {
    $timeout(() => {
      Wallet.beep();
      let message = 'BITCOIN_SENT';
      Alerts.displaySentBitcoin(message);
      let note = `SFOX Sell Order SFX-${$scope.trade.id}`;
      if (note !== '') Wallet.setNote({ hash: tx.txid }, note);
    }, 500);
  };

  $scope.siftScienceEnabled = false;
}
