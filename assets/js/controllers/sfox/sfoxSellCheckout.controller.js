angular
  .module('walletApp')
  .controller('SfoxSellCheckoutController', SfoxSellCheckoutController);

function SfoxSellCheckoutController ($scope, $timeout, $stateParams, $q, Wallet, MyWalletHelpers, Exchange, Alerts, currency, modals, sfox, $rootScope, buyMobile, localStorageService, MyWallet, Env) {
  // Env.then(env => {
  //   let links = env.partners.sfox.surveyLinks;
  //
  //   $scope.handleCancel = (skipConfirm) => {
  //     if (skipConfirm) $scope.goTo('create');
  //     else Alerts.surveyCloseConfirm('sfox-sell-survey', links, links.length - 1).then(() => { $scope.goTo('create'); }).catch(() => {});
  //   };
  // });
  console.log('SfoxSellCheckoutController', $scope, $scope.checkout);
  let exchange = $scope.checkout.exchange;
  let enableSiftScience = () => $q.resolve($scope.siftScienceEnabled = true);
  // $scope.checkout.fetchTransactions = () => MyWallet.wallet.getHistory();

  $scope.bitcoin = currency.bitCurrencies.filter(c => c.code === 'BTC')[0];

  $scope.selling = sfox.selling;
  $scope.sellQuoteHandler = sfox.fetchSellQuote.bind(null, exchange);

  $scope.sellHandler = (quote) => sfox.sell($scope.state.account, quote)
    .then(submitTx)
    .then(recordNote)
    .then($scope.checkout.fetchTransactions)
    .then(enableSiftScience)
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

    $scope.payment.sideEffect((payment) => {
      $scope.quote = quote;
      $scope.goTo('confirm');
      $scope.sellDetails = sfox.sellTradeDetails($scope.quote, payment);
    });

    return quote;
  };

  $scope.sellRefresh = () => {
    let { baseAmount, quoteAmount, baseCurrency } = $scope.quote;
    let btc = baseCurrency === 'BTC' ? baseAmount : quoteAmount;
    return $q.resolve($scope.sellQuoteHandler(btc, $scope.bitcoin.code, $scope.checkout.dollars.code).then($scope.buildPayment).then($scope.updateRate));
  };

  let submitTx = (trade) => {
    $scope.trade = trade;
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

  // $scope.openSfoxSignup = (quote) => {
  //   $scope.modalOpen = true;
  //   return modals.openSfoxSignup(exchange, quote).finally(() => { $scope.modalOpen = false; });
  // };

  // $scope.pendingTrades = () => exchange.trades.filter((t) => t.state === 'processing' && t.txHash);
  // $scope.completedTrades = () => exchange.trades.filter((t) => t.state !== 'processing' && t.txHash);

  // $scope.userId = exchange.user;
  $scope.siftScienceEnabled = false;
  // $scope.inspectTrade = (quote, trade) => modals.openTradeDetails(trade);
  // $scope.onClose = () => { $scope.goTo('create'); $scope.tabs.select('ORDER_HISTORY'); };

  // $scope.tabs = {
  //   selectedTab: $stateParams.selectedTab || 'SELL_BITCOIN',
  //   options: ['BUY_BITCOIN', 'SELL_BITCOIN', 'ORDER_HISTORY'],
  //   select (tab) { this.selectedTab = this.selectedTab ? tab : null; $scope.goTo('create'); }
  // };

  $scope.dismissSellIntro = sfox.dismissSellIntro;
  $scope.hasDismissedSellIntro = sfox.hasDismissedSellIntro;
  // $scope.email = MyWallet.wallet.accountInfo.email;
  // $scope.signupForBuyAccess = () => {
  //   let email = encodeURIComponent($scope.email);
  //   sfox.signupForBuyAccess(email);
  //   $scope.email = '';
  //   localStorageService.set('hasSignedUpForSfoxBuyAccess', true);
  // };
  // $scope.hasSignedUpForSfoxBuyAccess = () => localStorageService.get('hasSignedUpForSfoxBuyAccess');

  // $scope.goTo('create');
  // $scope.$watch('tabs.selectedTab', (t) => t === 'ORDER_HISTORY' && sfox.exchange.getTrades());
}
