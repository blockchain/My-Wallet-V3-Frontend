angular
  .module('walletApp')
  .controller('CoinifyController', CoinifyController);

function CoinifyController ($scope, $filter, $q, MyWallet, Wallet, MyWalletHelpers, Alerts, currency, $uibModalInstance, quote, trade, $timeout, $interval, formatTrade, buySell, $rootScope, $cookies, $window, $state, options, buyMobile) {
  $scope.settings = Wallet.settings;
  $scope.btcCurrency = $scope.settings.btcCurrency;
  $scope.currencies = currency.coinifyCurrencies;
  $scope.trades = buySell.trades;
  $scope.alerts = [];
  $scope.status = {};

  this.user = Wallet.user;
  this.quote = quote;
  this.trade = trade;
  this.baseFiat = () => !currency.isBitCurrency({code: this.quote.baseCurrency});
  this.fiatCurrency = () => this.baseFiat() ? this.quote.baseCurrency : this.quote.quoteCurrency;

  $scope.buySellDebug = $rootScope.buySellDebug;

  let accountIndex = MyWallet.wallet.hdwallet.defaultAccount.index;
  $scope.label = MyWallet.wallet.hdwallet.accounts[accountIndex].label;

  let exchange = buySell.getExchange();
  this.exchange = exchange && exchange.profile ? exchange : {profile: {}};
  this.eventualError = (message) => Promise.reject.bind(Promise, { message });
  this.getMinimumInAmount = (medium, curr) => medium && curr && quote.paymentMediums[medium].minimumInAmounts[curr];

  $scope.steps = {
    'email': 0,
    'accept-terms': 1,
    'select-payment-medium': 2,
    'summary': 3,
    'isx': 4,
    'trade-complete': 5
  };

  $scope.onStep = (...steps) => steps.some(s => $scope.step === $scope.steps[s]);
  $scope.afterStep = (step) => $scope.step > $scope.steps[step];
  $scope.beforeStep = (step) => $scope.step < $scope.steps[step];
  $scope.currentStep = () => Object.keys($scope.steps).filter($scope.onStep)[0];

  this.goTo = (step) => $scope.step = $scope.steps[step];

  if ((!this.user.isEmailVerified || $scope.rejectedEmail) && !this.exchange.user) {
    this.goTo('email');
  } else if (!this.exchange.user) {
    this.goTo('accept-terms');
  } else if (!this.trade) {
    this.goTo('select-payment-medium');
  } else if (!buySell.tradeStateIn(buySell.states.completed)(this.trade)) {
    this.goTo('isx');
  } else {
    this.goTo('trade-complete');
  }

  this.getMaxMin = (fiatCurrency) => {
    this.limits = {
      bank: {},
      card: {}
    };

    const calculateMin = (rate) => {
      this.limits.min = (rate * 10).toFixed(2);
      this.limits.absoluteMin = this.limits.min;
    };

    const calculateMax = (rate) => {
      this.limits.bank.max = buySell.calculateMax(rate, 'bank').max;
      this.limits.card.max = buySell.calculateMax(rate, 'card').max;
      this.limits.currency = $scope.currencySymbol;
      this.limits.absoluteMax = this.limits.bank.max > this.limits.card.max ? this.limits.bank.max : this.limits.card.max;
    };

    let min = buySell.getRate('EUR', fiatCurrency).then(calculateMin);
    let max = buySell.getRate(this.exchange.profile.defaultCurrency, fiatCurrency).then(calculateMax);

    return $q.all([min, max]);
  };

  $scope.hideQuote = () => $scope.isMedium('bank');

  $scope.standardError = (err) => {
    console.log(err);
    $scope.status = {};
    try {
      let e = JSON.parse(err);
      let msg = e.error.toUpperCase();
      if (msg === 'EMAIL_ADDRESS_IN_USE') $scope.rejectedEmail = true;
      else Alerts.displayError(msg, true, $scope.alerts, {user: this.exchange.user});
    } catch (e) {
      let msg = e.error || err.message;
      if (msg) Alerts.displayError(msg, true, $scope.alerts);
      else Alerts.displayError('INVALID_REQUEST', true, $scope.alerts);
    }
  };

  $scope.watchAddress = () => {
    if ($rootScope.buySellDebug) {
      console.log('$scope.watchAddress() for', this.trade);
    }
    if (!this.trade || $scope.bitcoinReceived || $scope.isKYC) return;
    const success = () => $timeout(() => $scope.bitcoinReceived = true);
    this.trade.watchAddress().then(success);
  };

  $scope.formatTrade = (state) => {
    if ($scope.needsKyc()) {
      let poll = buySell.pollUserLevel(buySell.kycs[0]);
      $scope.$on('$destroy', poll.cancel);
      return poll.result.then($scope.buy);
    }
  };

  $scope.onResize = (step) => $scope.isxStep = step;

  $scope.cancel = () => {
    $rootScope.$broadcast('fetchExchangeProfile');
    $uibModalInstance.dismiss('');
    buySell.getTrades().then(() => {
      $scope.goToOrderHistory();
    });
  };

  $scope.close = () => {
    let index;
    let links = options.partners.coinify.surveyLinks;

    if (!this.exchange.user) index = 0;
    else if (!$scope.trades.length) index = 1;
    else index = 2;
    Alerts.surveyCloseConfirm('survey-opened', links, index).then($scope.cancel);
  };

  $scope.exitToNativeTx = () => {
    buyMobile.callMobileInterface(buyMobile.SHOW_TX, $scope.trade.txHash);
  };

  $scope.getQuoteHelper = () => {
    if ($scope.quote && !$scope.expiredQuote && $scope.beforeStep('trade-formatted')) return 'AUTO_REFRESH';
    else if ($scope.quote && !$scope.quote.id) return 'EST_QUOTE_1';
    else if ($scope.expiredQuote) return 'EST_QUOTE_2';
    else return 'RATE_WILL_EXPIRE';
  };

  $scope.goToOrderHistory = () => {
    if ($scope.onStep('accept-terms') || $scope.onStep('trade-formatted') || !$scope.trades.pending.length || $state.params.selectedTab === 'ORDER_HISTORY') {
      $uibModalInstance.dismiss('');
    } else {
      $state.go('wallet.common.buy-sell.coinify', {selectedTab: 'ORDER_HISTORY'});
    }
  };

  $scope.fakeBankTransfer = () => $scope.trade.fakeBankTransfer().then(() => {
    $scope.formatTrade('processing');
    $scope.$digest();
  });

  $scope.$watch('bitcoinReceived', (newVal) => newVal && ($scope.formattedTrade = formatTrade['success']($scope.trade)));
}
