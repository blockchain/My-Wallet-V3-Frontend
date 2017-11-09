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

  $scope.buying = sfox.buying;
  $scope.buyHandler = (...args) => sfox.buy(...args);
  $scope.buyQuoteHandler = sfox.fetchQuote.bind(null, exchange);
  $scope.buyLimits = () => ({
    min: 10,
    max: sfox.profile && sfox.profile.limits.buy || 100
  });

  $scope.selling = sfox.selling;
  $scope.sellHandler = (...args) => sfox.sell(...args).then(buildPayment);
  $scope.sellQuoteHandler = sfox.fetchSellQuote.bind(null, exchange);
  $scope.sellLimits = () => ({
    min: 10,
    max: sfox.profile && sfox.profile.limits.sell || 100
  });

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

  let buildPayment = (trade) => {
    $scope.payment = Wallet.my.wallet.createPayment();
    $scope.payment.amount(trade.outAmount);
    $scope.payment.to(trade.receiveAddress);
    $scope.payment.updateFeePerKb(100);
    $scope.payment.from(Wallet.my.wallet.hdwallet.defaultAccountIndex);
    $scope.payment.build().sign().publish();

    // $scope.payment.sideEffect((p) => {
    //   $scope.goTo('confirm');
    // });
  };

  $scope.goTo('create');
}
