angular
  .module('walletApp')
  .controller('SfoxCheckoutController', SfoxCheckoutController);

function SfoxCheckoutController ($scope, $timeout, $stateParams, $q, Wallet, MyWalletHelpers, Exchange, Alerts, currency, modals, sfox, accounts, $rootScope, showCheckout, buyMobile) {
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
  $scope.sellLimits = () => ({
    min: 10,
    max: sfox.profile && sfox.profile.limits.sell || 100
  });

  $scope.buildPayment = (quote) => {
    let amt = quote.baseCurrency === 'BTC' ? quote.baseAmount : quote.quoteAmount;

    $scope.payment = Wallet.my.wallet.createPayment();
    $scope.payment.amount(amt);
    $scope.payment.updateFeePerKb(Exchange.sellFee);
    $scope.payment.from(Wallet.my.wallet.hdwallet.defaultAccountIndex);

    return $scope.payment.sideEffect((payment) => {
      $scope.quote = quote;
      $scope.goTo('confirm');
      $scope.sellDetails = sfox.sellTradeDetails($scope.quote, payment);
    });
  };

  $scope.sellRefresh = () => {
    let { baseAmount, quoteAmount, baseCurrency } = $scope.quote;
    let btc = baseCurrency === 'BTC' ? baseAmount : quoteAmount;
    return $q.resolve($scope.sellQuoteHandler(btc, $scope.bitcoin.code, $scope.dollars.code).then($scope.buildPayment));
  };

  let submitTx = (trade) => {
    $scope.trade = trade;
    // $scope.payment.to(trade.receiveAddress);
    $scope.payment.to('n3PKdDhR8HG5wD23qiZtPQoq5GyGwcXN5h');
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
  $scope.signupCompleted = accounts[0] && accounts[0].status === 'active';
  $scope.showCheckout = $scope.signupCompleted || (showCheckout && !$scope.userId);

  $scope.tabs = {
    selectedTab: $stateParams.selectedTab || 'SELL_BITCOIN',
    options: ['SELL_BITCOIN', 'ORDER_HISTORY'],
    select (tab) { this.selectedTab = this.selectedTab ? tab : null; }
  };

  $scope.goTo('create');
}
