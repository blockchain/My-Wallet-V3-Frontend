angular
  .module('walletApp')
  .controller('SfoxCheckoutController', SfoxCheckoutController);

function SfoxCheckoutController ($scope, $timeout, $stateParams, $q, Wallet, MyWalletHelpers, Exchange, Alerts, currency, modals, sfox, accounts, $rootScope, buyMobile, localStorageService, MyWallet, Env) {
  Env.then(env => {
    let links = env.partners.sfox.surveyLinks;

    $scope.handleCancel = (skipConfirm) => {
      if (skipConfirm) $scope.goTo('create');
      else Alerts.surveyCloseConfirm('sfox-sell-survey', links, links.length - 1).then(() => { $scope.goTo('create'); }).catch(() => {});
    };
  });

  sfox.accounts = accounts;

  let exchange = $scope.vm.external.sfox;
  let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});
  let enableSiftScience = (trade) => { $scope.tradeId = trade.id; $scope.siftScienceEnabled = true; };

  $scope.steps = enumify('state-select', 'create', 'confirm', 'receipt');
  $scope.onStep = (s) => $scope.steps[s] === $scope.step;
  $scope.goTo = (s) => $scope.step = $scope.steps[s];

  $scope.dollars = currency.currencies.filter(c => c.code === 'USD')[0];
  $scope.bitcoin = currency.bitCurrencies.filter(c => c.code === 'BTC')[0];

  $scope.selling = sfox.selling;
  $scope.sellQuoteHandler = sfox.fetchSellQuote.bind(null, exchange);
  $scope.sellHandler = (quote) => sfox.sell($scope.state.account, quote)
    .then((trade) => { submitTx(trade); enableSiftScience(trade); });

  const setRate = (res) => { $scope.rate = Math.abs(res.quoteAmount); };
  $scope.getRate = () => $scope.sellQuoteHandler(1e8, 'BTC', $scope.dollars.code).then(setRate);
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
    return $q.resolve($scope.sellQuoteHandler(btc, $scope.bitcoin.code, $scope.dollars.code).then($scope.buildPayment).then($scope.updateRate));
  };

  let submitTx = (trade) => {
    $scope.trade = trade;
    $scope.payment.to(trade.receiveAddress);
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
    buyLevel: exchange.profile && exchange.profile.verificationStatus.level
  };

  $scope.pendingTrades = () => exchange.trades.filter((t) => t.state === 'processing' && t.txHash);
  $scope.completedTrades = () => exchange.trades.filter((t) => t.state !== 'processing' && t.txHash);

  $scope.setState = () => {
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
    select (tab) { this.selectedTab = this.selectedTab ? tab : null; $scope.goTo('create'); }
  };

  $scope.dismissSellIntro = sfox.dismissSellIntro;
  $scope.hasDismissedSellIntro = sfox.hasDismissedSellIntro;
  $scope.email = MyWallet.wallet.accountInfo.email;
  $scope.signupForBuyAccess = () => {
    let email = encodeURIComponent($scope.email);
    sfox.signupForBuyAccess(email);
    $scope.email = '';
    localStorageService.set('hasSignedUpForSfoxBuyAccess', true);
  };
  $scope.hasSignedUpForSfoxBuyAccess = () => localStorageService.get('hasSignedUpForSfoxBuyAccess');

  $scope.goTo('create');
}
