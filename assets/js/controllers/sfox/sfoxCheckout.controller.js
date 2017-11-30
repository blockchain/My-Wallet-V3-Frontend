angular
  .module('walletApp')
  .controller('SfoxCheckoutController', SfoxCheckoutController);

function SfoxCheckoutController ($scope, $timeout, $stateParams, $q, Wallet, MyWalletHelpers, Exchange, Alerts, currency, modals, sfox, accounts, $rootScope, buyMobile) {
  sfox.accounts = accounts;

  let exchange = $scope.vm.external.sfox;
  let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

  $scope.steps = enumify('state-select', 'create', 'confirm', 'receipt');
  $scope.onStep = (s) => $scope.steps[s] === $scope.step;
  $scope.goTo = (s) => $scope.step = $scope.steps[s];

  $scope.trades = exchange.trades;
  $scope.dollars = currency.currencies.filter(c => c.code === 'USD')[0];
  $scope.bitcoin = currency.bitCurrencies.filter(c => c.code === 'BTC')[0];

  $scope.selling = sfox.selling;
  $scope.sellQuoteHandler = sfox.fetchSellQuote.bind(null, exchange);
  $scope.sellHandler = (quote) => sfox.sell($scope.state.account, quote).then((trade) => submitTx(trade));

  const setRate = (res) => { $scope.rate = Math.abs(res.quoteAmount); };
  $scope.getRate = () => $scope.sellQuoteHandler(1e8, 'BTC', $scope.dollars.code).then(setRate);
  $scope.getRate().then(() => sfox.setSellMin($scope.sellLimits($scope.rate).min));
  $scope.updateRate = (quote) => $scope.rate = quote.rate;

  $scope.sellLimits = (rate) => {
    return {
      min: 10 / rate,
      max: Math.min(sfox.profile.limits.sell / rate, Exchange.sellMax)
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
    return $q.resolve($scope.sellQuoteHandler(btc, $scope.bitcoin.code, $scope.dollars.code).then($scope.buildPayment).then($scope.updateRate));
  };

  let submitTx = (trade) => {
    $scope.trade = trade;
    // $scope.payment.to(trade.receiveAddress);
    $scope.payment.to(Wallet.my.wallet.hdwallet.defaultAccount.receiveAddress);
    return Wallet.askForSecondPasswordIfNeeded().then((pw) => {
      return $scope.payment.build().sign(pw).publish().payment;
    });
  };

  $scope.openSfoxSignup = (quote) => {
    $scope.modalOpen = true;
    return modals.openSfoxSignup(exchange, quote).finally(() => { $scope.modalOpen = false; });
  };

  $scope.state = {
    account: accounts[0],
    trades: exchange.trades,
    buyLevel: exchange.profile && exchange.profile.verificationStatus.level
  };

  $scope.setState = () => {
    $scope.state.trades = exchange.trades;
    $scope.state.buyLevel = exchange.profile && exchange.profile.verificationStatus.level;
  };

  $scope.stepDescription = () => {
    let stepDescriptions = {
      'verify': { text: 'Verify Identity', i: 'ti-id-badge' },
      'upload': { text: 'Verify Identity', i: 'ti-id-badge' },
      'link': { text: 'Link Payment', i: 'ti-credit-card bank bank-lrg' }
    };
    let step = sfox.determineStep(exchange, accounts);
    return stepDescriptions[step];
  };

  $scope.userId = exchange.user;
  $scope.siftScienceEnabled = false;
  $scope.inspectTrade = (quote, trade) => modals.openTradeDetails(trade);
  $scope.onClose = () => { $scope.goTo('create'); $scope.tabs.select('ORDER_HISTORY'); };

  $scope.tabs = {
    selectedTab: $stateParams.selectedTab || 'SELL_BITCOIN',
    options: ['BUY_BITCOIN', 'SELL_BITCOIN', 'ORDER_HISTORY'],
    select (tab) { this.selectedTab = this.selectedTab ? tab : null; }
  };

  $scope.goTo('create');
}
