angular
  .module('walletApp')
  .controller('BuyCtrl', BuyCtrl);

function BuyCtrl ($scope, $filter, $q, MyWallet, Wallet, MyWalletHelpers, Alerts, currency, $uibModalInstance, fiat, trade, $timeout, $interval, bitcoinReceived, formatTrade, buySell) {
  $scope.settings = Wallet.settings;
  $scope.btcCurrency = $scope.settings.btcCurrency;
  $scope.currencies = currency.coinifyCurrencies;
  $scope.user = Wallet.user;
  $scope.trades = buySell.trades;
  $scope.alerts = [];
  $scope.status = {};
  $scope.trade = trade;
  $scope.label = MyWallet.wallet.hdwallet.accounts[0].label;

  $scope.method = $scope.trade ? $scope.trade.medium : 'card';
  $scope.methods = {};
  $scope.getMethod = () => $scope.methods[$scope.method] || {};

  let exchange = buySell.getExchange();
  $scope.exchange = exchange && exchange.profile ? exchange : {profile: {}};

  $scope.isKYC = $scope.trade && $scope.trade.constructor.name === 'CoinifyKYC';
  $scope.needsKyc = () => $scope.getMethod().inMedium === 'bank' && +$scope.exchange.profile.level.name < 2;

  let fifteenMinutesAgo = new Date(new Date().getTime() - 15 * 60 * 1000);
  $scope.expiredQuote = $scope.trade && fifteenMinutesAgo > $scope.trade.createdAt;
  let updateBTCExpected = (quote) => { $scope.status.gettingQuote = false; $scope.btcExpected = quote; };

  $scope.steps = {
    'amount': 0,
    'select-country': 1,
    'email': 2,
    'accept-terms': 3,
    'select-payment-method': 4,
    'summary': 5,
    'trade-formatted': 6,
    'trade-complete': 7,
    'pending': 8,
    'success': 9
  };

  $scope.onStep = (...steps) => steps.some(s => $scope.step === $scope.steps[s]);
  $scope.afterStep = (step) => $scope.step > $scope.steps[step];
  $scope.beforeStep = (step) => $scope.step < $scope.steps[step];
  $scope.currentStep = () => Object.keys($scope.steps).filter($scope.onStep)[0];

  $scope.goTo = (step) => $scope.step = $scope.steps[step];
  $scope.goTo('amount');

  $scope.formattedTrade = undefined;
  $scope.bitcoinReceived = bitcoinReceived;

  $scope.fields = { email: $scope.user.email, countryCode: $scope.exchange.profile.country };
  $scope.transaction = {fiat: fiat || 0, btc: 0, fee: 0, total: 0, currency: buySell.getCurrency()};
  $scope.currencySymbol = currency.conversions[$scope.transaction.currency.code];

  $timeout(() => !$scope.isKYC && $scope.getPaymentMethods());
  $timeout(() => $scope.rendered = true, bitcoinReceived ? 0 : 4000);

  $scope.userHasExchangeAcct = $scope.trades.pending.length || $scope.trades.completed.length;

  $scope.getPaymentMethods = () => {
    if (!$scope.exchange.user) { $scope.getQuote(); return; }

    $scope.status.waiting = true;

    let success = (methods) => {
      $scope.methods = {
        card: methods.filter((m) => m.inMedium === 'card')[0],
        bank: methods.filter((m) => m.inMedium === 'bank')[0]
      };
    };

    return $scope.exchange.getPaymentMethods($scope.transaction.currency.code, 'BTC')
      .then(success).then(() => $scope.getQuote());
  };

  $scope.changeCurrency = (curr) => {
    if (!curr) curr = buySell.getCurrency();
    if ($scope.trade && !$scope.isKYC) curr = {code: $scope.trade.inCurrency};

    $scope.changeCurrencySymbol(curr);

    const success = () => {
      $scope.transaction.currency = curr;
    };

    return Wallet.changeCurrency(curr).then(success)
                                      .then($scope.getPaymentMethods);
  };

  $scope.changeCurrencySymbol = (curr) => {
    $scope.currencySymbol = currency.conversions[curr.code];
  };

  $scope.standardError = (err) => {
    console.log(err);
    $scope.status = {};
    try {
      let e = JSON.parse(err);
      let msg = e.error.toUpperCase();
      if (msg === 'EMAIL_ADDRESS_IN_USE') $scope.rejectedEmail = true;
      else Alerts.displayError(msg, true, $scope.alerts, {user: $scope.exchange.user});
    } catch (e) {
      let msg = e.error || err.message;
      if (msg) Alerts.displayError(msg, true, $scope.alerts);
      else Alerts.displayError('INVALID_REQUEST', true, $scope.alerts);
    }
  };

  $scope.fetchProfile = () => $scope.exchange.fetchProfile();

  $scope.updateAmounts = () => {
    if (!$scope.trade && (!$scope.quote || !$scope.exchange.user)) return;

    let fiatAmt = $scope.transaction.fiat;
    let methodFee = fiatAmt * ($scope.getMethod().inPercentageFee / 100);

    $scope.transaction.methodFee = methodFee.toFixed(2);
    $scope.transaction.total = fiatAmt + +$scope.transaction.methodFee;
  };

  $scope.getQuote = () => {
    if ($scope.trade) { $scope.updateAmounts(); return; }

    $scope.quote = null;
    $scope.transaction.btc = 0;
    $scope.status.gettingQuote = true;
    if (!$scope.transaction.fiat) { $scope.status = {}; return; }

    const success = (quote) => {
      $scope.status = {};
      $scope.quote = quote;
      $scope.updateAmounts();
      Alerts.clear($scope.alerts);
      $scope.transaction.btc = currency.formatCurrencyForView($scope.quote.quoteAmount, currency.bitCurrencies[0]);
    };

    let quote = $scope.exchange.getBuyQuote($scope.transaction.fiat, $scope.transaction.currency.code);
    return $q.resolve(quote).then(success, $scope.standardError);
  };

  $scope.toggleEmail = () => $scope.editEmail = !$scope.editEmail;
  $scope.isCurrencySelected = (currency) => currency === $scope.transaction.currency;

  $scope.addExchange = () => {
    $scope.exchange = buySell.getExchange();
    $scope.partner = 'Coinify';
  };

  $scope.nextStep = () => {
    if (!$scope.transaction.fiat && !$scope.isKYC) {
      $scope.goTo('amount');
    } else if ((!$scope.fields.countryCode && !$scope.afterStep('amount')) || ($scope.onStep('amount') && !$scope.exchange.user)) {
      $scope.goTo('select-country');
    } else if ((!$scope.user.isEmailVerified || $scope.rejectedEmail) && !$scope.exchange.user) {
      $scope.goTo('email');
    } else if (!$scope.exchange.user) {
      $scope.goTo('accept-terms');
    } else if (!$scope.isMethodSelected && !$scope.trade) {
      $scope.goTo('select-payment-method');
      $scope.isMethodSelected = true;
    } else if (!$scope.trade) {
      $scope.goTo('summary');
    } else if (!$scope.paymentInfo && !$scope.formattedTrade) {
      $scope.goTo('trade-formatted');
    } else if (!$scope.formattedTrade) {
      $scope.goTo('trade-complete');
    } else if (!$scope.bitcoinReceived) {
      $scope.goTo('pending');
    } else {
      $scope.goTo('success');
    }
  };

  $scope.prevStep = () => {
    if ($scope.status.waiting) return;

    if ($scope.exchange.user) {
      $scope.goTo('amount');
      $scope.isMethodSelected = false;
    } else if ($scope.afterStep('email')) {
      $scope.goTo('select-country');
    } else {
      $scope.step--;
    }
  };

  $scope.isDisabled = () => {
    if ($scope.onStep('amount')) {
      return !($scope.transaction.fiat > 0);
    } else if ($scope.onStep('select-country')) {
      return !$scope.fields.countryCode || $scope.isCountryBlacklisted;
    } else if ($scope.onStep('accept-terms')) {
      return !$scope.signupForm.$valid;
    } else if ($scope.onStep('summary')) {
      return $scope.editAmount;
    }
  };

  $scope.changeEmail = (email, successCallback, errorCallback) => {
    $scope.rejectedEmail = void 0;
    Alerts.clear($scope.alerts);

    $q((res, rej) => Wallet.changeEmail(email, res, rej))
      .then(successCallback, errorCallback)
      .finally(() => { $scope.editEmail = false; });
  };

  $scope.signup = () => {
    $scope.status.waiting = true;
    Alerts.clear($scope.alerts);

    return $scope.exchange.signup($scope.fields.countryCode)
      .then(() => $scope.fetchProfile())
      .then(() => $scope.changeCurrency())
      .catch($scope.standardError);
  };

  $scope.watchAddress = () => {
    if (!$scope.trade || $scope.bitcoinReceived || $scope.isKYC) return;
    const success = () => $timeout(() => $scope.bitcoinReceived = true);
    $scope.trade.watchAddress().then(success);
  };

  $scope.buy = () => {
    $scope.status.waiting = true;

    let success = (trade) => {
      Alerts.clear($scope.alerts);
      $scope.trade = trade;
    };

    // check if bank transfer and kyc level
    if ($scope.needsKyc()) {
      return buySell.getOpenKYC().then(success, $scope.standardError);
    }

    $scope.exchange.buy($scope.transaction.fiat, $scope.transaction.currency.code, $scope.getMethod().inMedium)
                   .then(success, $scope.standardError)
                   .then($scope.watchAddress);
  };

  $scope.loadPayment = () => {
    if ($scope.onStep('trade-formatted')) return;
    $scope.status = {};
    $scope.nextStep();
  };

  $scope.declinedTx = (tx) => {
    $scope.formattedTrade = formatTrade.error(tx, $scope.trade, 'DECLINED_TRANSACTION');
  };

  $scope.failedTx = (tx) => {
    $scope.formattedTrade = formatTrade.error(tx, $scope.trade, 'FAILED_TRANSACTION');
  };

  $scope.expiredTx = (tx) => {
    $scope.formattedTrade = formatTrade.error(tx, $scope.trade, 'TX_EXPIRED');
  };

  $scope.successTx = (tx) => {
    $scope.formattedTrade = formatTrade.success(tx, $scope.trade);
  };

  $scope.reviewTx = (tx) => {
    let type = $scope.isKYC || $scope.needsKyc() ? 'kyc' : 'review';
    $scope.formattedTrade = formatTrade[type](tx, $scope.trade);
  };

  $scope.pendingTx = (tx) => {
    if (!tx) return;
    if ($scope.formattedTrade && $scope.formattedTrade.class === 'success') return;

    if ($scope.needsKyc()) {
      buySell.pollingLevel = true;
      return buySell.pollUserLevel().then($scope.buy).finally(() => $scope.pollingLevel = false);
    }

    $scope.formattedTrade = formatTrade.pending(tx, $scope.trade);
  };

  $scope.onResize = (step) => {
    $scope.isxStep = step;
  };

  $scope.cancel = () => {
    if ($scope.exchange.user) buySell.getTrades();
    $uibModalInstance.dismiss('');
    $scope.trade = null;
  };

  $scope.close = (acct) => {
    let text, action;
    if ($scope.onStep('amount')) {
      [text, action] = ['CONFIRM_CLOSE_AMT', 'CLOSE'];
    } else if (acct) {
      [text, action] = ['CONFIRM_CLOSE', 'IM_DONE'];
    } else {
      [text, action] = ['CONFIRM_CLOSE_ACCT', 'IM_DONE'];
    }
    Alerts.confirm(text, {action: action}).then($scope.cancel);
  };

  $scope.$watch('method', $scope.updateAmounts);
  $scope.$watchGroup(['exchange.user', 'paymentInfo', 'formattedTrade'], $scope.nextStep);

  $scope.$watch('user.isEmailVerified', () => {
    if ($scope.onStep('email')) $scope.nextStep();
  });

  $scope.$watch('exchange.user', (newVal, oldVal) => {
    if (newVal !== oldVal) $scope.changeCurrency();
  });

  $scope.$watch('bitcoinReceived', (newVal) => {
    if (newVal) $scope.successTx();
  });

  $scope.$watch('expiredQuote', (newVal) => {
    if (newVal) {
      $scope.status.gettingQuote = true;
      if (!$scope.trade) $scope.getQuote();
      else $scope.trade.btcExpected().then(updateBTCExpected);
    }
  });

  $scope.$watch('step', (newVal) => {
    if (!$scope.partner) $scope.addExchange();
    if ($scope.exchange.user && !$scope.exchange.profile) $scope.fetchProfile().catch($scope.standardError);
    if ($scope.steps['email'] === newVal && !Wallet.goal.firstLogin) Wallet.resendEmailConfirmation();
  });

  if ($scope.trade && !bitcoinReceived) {
    $scope.nextStep();
    $scope.watchAddress();
  }

  $scope.initBuy = () => {
    $uibModalInstance.dismiss('');
    $timeout(() => buySell.openBuyView());
  };
}
