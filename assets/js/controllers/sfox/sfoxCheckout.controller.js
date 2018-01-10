angular
  .module('walletApp')
  .controller('SfoxCheckoutController', SfoxCheckoutController);

function SfoxCheckoutController ($scope, $timeout, $stateParams, $q, Wallet, MyWalletHelpers, Exchange, Alerts, currency, modals, sfox, accounts, $rootScope, buyMobile, localStorageService, MyWallet, Env) {
  $scope.checkout = this;
  Env.then(env => {
    let links = env.partners.sfox.surveyLinks;

    this.handleCancel = (skipConfirm) => {
      if (skipConfirm) $scope.checkout.goTo('create');
      else Alerts.surveyCloseConfirm('sfox-sell-survey', links, links.length - 1).then(() => { $scope.checkout.goTo('create'); }).catch(() => {});
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

  $scope.pendingTrades = () => this.exchange.trades.filter((t) => t.state === 'processing');
  $scope.completedTrades = () => this.exchange.trades.filter((t) => t.state !== 'processing');

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
  $scope.onClose = () => { $scope.checkout.goTo('create'); $scope.tabs.select('ORDER_HISTORY'); };

  $scope.tabs = {
    selectedTab: $stateParams.selectedTab || 'BUY_BITCOIN',
    options: ['BUY_BITCOIN', 'SELL_BITCOIN', 'ORDER_HISTORY'],
    select (tab) { this.selectedTab = this.selectedTab ? tab : null; $scope.checkout.goTo('create'); }
  };

  $scope.hasDismissedSellIntro = sfox.hasDismissedSellIntro;
  $scope.email = MyWallet.wallet.accountInfo.email;
  $scope.signupForBuyAccess = () => {
    let email = encodeURIComponent($scope.email);
    sfox.signupForBuyAccess(email);
    $scope.email = '';
    localStorageService.set('hasSignedUpForSfoxBuyAccess', true);
  };
  $scope.hasSignedUpForSfoxBuyAccess = () => localStorageService.get('hasSignedUpForSfoxBuyAccess');

  $scope.checkout.goTo('create');
  $scope.$watch('tabs.selectedTab', (t) => t === 'ORDER_HISTORY' && sfox.exchange.getTrades());
}
