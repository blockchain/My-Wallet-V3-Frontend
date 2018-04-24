angular
  .module('walletApp')
  .controller('SfoxCheckoutController', SfoxCheckoutController);

function SfoxCheckoutController ($scope, $timeout, $stateParams, $q, Wallet, MyWalletHelpers, Exchange, Alerts, currency, modals, sfox, accounts, $rootScope, buyMobile, localStorageService, MyWallet, Env) {
  $scope.checkout = this;
  Env.then(env => {
    let sellLinks = env.partners.sfox.surveyLinks;
    let buyLinks = env.partners.sfox.buySurveyLinks;

    $scope.showBuy = () => MyWallet.wallet.accountInfo.invited.sfoxBuy;
    $scope.pendingBuyTrades = () => $scope.pendingTrades().filter((t) => t.isBuy);
    $scope.pendingSellTrades = () => $scope.pendingTrades().filter((t) => !t.isBuy);
    $scope.pendingBuyTradesTotal = () => $scope.pendingBuyTrades().map((t) => t.receiveAmount).reduce((acc, amt) => acc + amt).toFixed(8);
    $scope.pendingSellTradesTotal = () => $scope.pendingSellTrades().map((t) => t.receiveAmount).reduce((acc, amt) => acc + amt).toFixed(2);

    this.handleCancel = (skipConfirm, type, step) => {
      if (skipConfirm) $scope.checkout.goTo('create');
      if (type === 'sell') Alerts.surveyCloseConfirm('sfox-sell-survey', sellLinks, sellLinks.length - 1).then(() => { $scope.checkout.goTo('create'); }).catch(() => { });
      if (type === 'buy') Alerts.surveyCloseConfirm('sfox-buy-survey', buyLinks, step).then(() => { $scope.checkout.goTo('create'); }).catch(() => { });
    };

    $scope.tabs = {
      options: ['BUY_BITCOIN', 'SELL_BITCOIN', 'ORDER_HISTORY'],
      selectedTab: $stateParams.selectedTab || $scope.showBuy() ? 'BUY_BITCOIN' : 'SELL_BITCOIN',
      select (tab) { this.selectedTab = this.selectedTab ? tab : null; $scope.checkout.goTo('create'); }
    };
  });

  sfox.accounts = this.accounts = accounts;

  this.exchange = $scope.vm.external.sfox;
  let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});
  this.fetchTransactions = () => MyWallet.wallet.getHistory();

  $scope.steps = enumify('state-select', 'create', 'confirm', 'receipt');
  this.onStep = (s) => $scope.steps[s] === $scope.step;
  this.goTo = (s) => $scope.step = $scope.steps[s];

  this.dollars = currency.currencies.filter(c => c.code === 'USD')[0];
  this.bitcoin = currency.bitCurrencies.filter(c => c.code === 'BTC')[0];

  this.openSfoxSignup = (quote) => {
    $scope.modalOpen = true;
    return modals.openSfoxSignup(this.exchange, quote).finally(() => { $scope.modalOpen = false; });
  };

  this.state = {
    account: accounts[0],
    buyLevel: this.exchange.profile && this.exchange.profile.verificationStatus.level
  };

  $scope.pendingTrades = () => this.exchange.trades.filter((t) => t.state === 'processing' && t.inAmount);
  $scope.completedTrades = () => this.exchange.trades.filter((t) => t.state !== 'processing' && t.inAmount);

  $scope.setState = () => {
    this.state.buyLevel = this.exchange.profile && this.exchange.profile.verificationStatus.level;
  };

  $scope.stepDescription = () => {
    let stepDescriptions = {
      'verify': { text: 'Verify Identity', i: 'ti-id-badge' },
      'upload': { text: 'Verify Identity', i: 'ti-id-badge' },
      'link': { text: 'Link Payment', i: 'ti-credit-card bank bank-lrg' }
    };
    let step = sfox.determineStep(this.exchange, accounts);
    return stepDescriptions[step];
  };

  this.userId = this.exchange.user;
  $scope.siftScienceEnabled = false;
  $scope.inspectTrade = (quote, trade) => modals.openTradeDetails(trade);
  $scope.onClose = () => {
    const seenBuySurvey = localStorageService.get('sfox-buy-survey');
    if (seenBuySurvey && seenBuySurvey.index < 1 && this.type === 'buy') this.handleCancel(null, 'buy', 1);
    else $scope.checkout.goTo('create'); $scope.tabs.select('ORDER_HISTORY');
  };

  $scope.email = MyWallet.wallet.accountInfo.email;
  $scope.signupForBuyAccess = () => {
    let email = encodeURIComponent($scope.email);
    sfox.signupForBuyAccess(email);
    $scope.email = '';
    localStorageService.set('hasSignedUpForSfoxBuyAccess', true);
  };
  $scope.hasSignedUpForSfoxBuyAccess = () => localStorageService.get('hasSignedUpForSfoxBuyAccess');
  this.dismissSellIntro = sfox.dismissSellIntro;
  this.hasDismissedSellIntro = sfox.hasDismissedSellIntro;
  this.dismissBuyIntro = sfox.dismissBuyIntro;
  this.hasDismissedBuyIntro = sfox.hasDismissedBuyIntro;

  $scope.checkout.goTo('create');
  $scope.$watch('tabs.selectedTab', (t) => t === 'ORDER_HISTORY' && sfox.exchange.getTrades());
}
