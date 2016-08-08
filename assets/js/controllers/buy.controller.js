angular
  .module('walletApp')
  .controller('BuyCtrl', BuyCtrl);

function BuyCtrl ($scope, $filter, $q, MyWallet, Wallet, Alerts, currency, $uibModalInstance, country, fiat, trade, $timeout, bitcoinReceived, formatTrade, buySell) {
  $scope.settings = Wallet.settings;
  $scope.btcCurrency = $scope.settings.btcCurrency;
  $scope.currencies = currency.coinifyCurrencies;
  $scope.countries = country;
  $scope.user = Wallet.user;
  $scope.trades = buySell.trades;
  $scope.alerts = [];
  $scope.status = {};
  $scope.trade = trade;
  $scope.label = MyWallet.wallet.hdwallet.accounts[0].label;

  let exchange = buySell.getExchange();
  $scope.exchange = exchange && exchange.profile ? exchange : {profile: {}};

  $scope.steps = {
    'amount': 0,
    'select-country': 1,
    'email': 2,
    'accept-terms': 3,
    'summary': 4,
    'trade-formatted': 5,
    'trade-complete': 6,
    'pending': 7,
    'success': 8
  };

  $scope.onStep = (...steps) => steps.some(s => $scope.step === $scope.steps[s]);
  $scope.afterStep = (step) => $scope.step > $scope.steps[step];
  $scope.beforeStep = (step) => $scope.step < $scope.steps[step];

  $scope.goTo = (step) => $scope.step = $scope.steps[step];
  $scope.goTo('amount');

  $scope.formattedTrade = undefined;
  $scope.bitcoinReceived = bitcoinReceived;

  $scope.fields = { email: $scope.user.email, countryCode: $scope.exchange.profile.country };
  $scope.transaction = {fiat: 0, btc: 0, fee: 0, total: 0, currency: $scope.settings.currency};
  $scope.transaction.fiat = fiat || 0;
  $scope.paymentInfo = undefined;

  $timeout(() => $scope.rendered = true, bitcoinReceived ? 0 : 4000);

  $scope.countryCodeGuess = $scope.countries.countryCodes.filter(country => country.code === MyWallet.wallet.accountInfo.countryCodeGuess)[0];
  if ($scope.countryCodeGuess) $scope.fields.countryCode = $scope.countryCodeGuess.code;

  $scope.userHasExchangeAcct = $scope.trades.pending.length || $scope.trades.completed.length;

  $scope.getPaymentMethods = () => {
    if (!$scope.exchange.user) return;

    const success = (methods) => {
      $scope.card = methods.filter((m) => m.inMedium === 'card')[0];
      $scope.bank = methods.filter((m) => m.inMedium === 'bank')[0];
      $scope.method = $scope.card;
      $scope.getQuote();
    };

    $scope.exchange.getPaymentMethods($scope.transaction.currency.code, 'BTC').then(success);
  };

  $scope.changeCurrency = (curr) => {
    if (!curr) curr = $scope.settings.currency;
    if ($scope.trade) curr = {code: $scope.trade.inCurrency};

    $scope.currencySymbol = currency.conversions[curr.code];

    const success = () => {
      $scope.transaction.currency = curr;
      $scope.getPaymentMethods();
    };

    Wallet.changeCurrency(curr).then(success);
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

  $scope.fetchProfile = () => {
    return $scope.exchange.fetchProfile().catch($scope.standardError);
  };

  $scope.updateAmounts = () => {
    if (!$scope.quote || !$scope.exchange.user) return;

    let fiatAmt = $scope.transaction.fiat;
    let methodFee = fiatAmt * ($scope.method.inPercentageFee / 100);

    $scope.transaction.methodFee = methodFee.toFixed(2);
    $scope.transaction.btc = currency.formatCurrencyForView($scope.quote.quoteAmount, currency.bitCurrencies[0]);
    $scope.transaction.total = fiatAmt + +$scope.transaction.methodFee;
  };

  $scope.getQuote = () => {
    if (!$scope.exchange.user) return;

    $scope.quote = null;
    $scope.transaction.btc = 0;

    if (!$scope.transaction.fiat) return;

    $scope.status.waiting = true;

    const success = (quote) => {
      $scope.status = {};
      $scope.quote = quote;
      $scope.updateAmounts();
      Alerts.clear($scope.alerts);
    };

    $scope.exchange.getBuyQuote($scope.transaction.fiat, $scope.transaction.currency.code)
                   .then(success, $scope.standardError);
  };

  $scope.toggleEmail = () => $scope.editEmail = !$scope.editEmail;
  $scope.isCurrencySelected = (currency) => currency === $scope.transaction.currency;

  $scope.addExchange = () => {
    if (!$scope.fields.countryCode) return;
    if (!MyWallet.wallet.external.coinify) MyWallet.wallet.external.addCoinify();
    $scope.exchange = MyWallet.wallet.external.coinify;
    $scope.partner = 'Coinify';
  };

  $scope.nextStep = () => {
    if (!$scope.transaction.fiat) {
      $scope.goTo('amount');
    } else if ((!$scope.fields.countryCode && !$scope.afterStep('amount')) || ($scope.onStep('amount') && !$scope.exchange.user)) {
      $scope.goTo('select-country');
    } else if (!$scope.user.isEmailVerified || $scope.rejectedEmail) {
      $scope.goTo('email');
    } else if (!$scope.exchange.user) {
      $scope.goTo('accept-terms');
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
      return !$scope.fields.countryCode;
    } else if ($scope.onStep('accept-terms')) {
      return !$scope.signupForm.$valid;
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

    const success = () => {
      Alerts.clear($scope.alerts);
      $scope.fetchProfile().then($scope.changeCurrency);
    };

    $scope.exchange.signup($scope.fields.countryCode)
      .then(success).catch($scope.standardError);
  };

  $scope.watchAddress = () => {
    if (!$scope.trade || $scope.bitcoinReceived) return;
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
    if ($scope.method.inMedium === 'bank' &&
        parseInt($scope.exchange.profile.level.name, 10) < 2) {
      $scope.exchange.triggerKYC().then(success, $scope.standardError);
      return;
    }

    $scope.exchange.buy($scope.transaction.fiat, $scope.transaction.currency.code, $scope.method.inMedium)
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
    $scope.formattedTrade = formatTrade.success($scope.trade);
  };

  $scope.reviewTx = (tx) => {
    $scope.formattedTrade = formatTrade.review(tx, $scope.trade);
  };

  $scope.pendingTx = (tx) => {
    if (!tx) return;
    if ($scope.formattedTrade && $scope.formattedTrade.status === 'success') return;

    $scope.formattedTrade = formatTrade.pending(tx, $scope.trade);
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
  $scope.$watch('exchange.user', $scope.changeCurrency());
  $scope.$watchGroup(['exchange.user', 'user.isEmailVerified', 'paymentInfo', 'formattedTrade'], $scope.nextStep);

  $scope.$watch('transaction.fiat', (newVal, oldVal) => {
    if (newVal !== oldVal) $scope.changeCurrency();
  });

  $scope.$watch('bitcoinReceived', (newVal) => {
    if (newVal) $scope.successTx();
  });

  $scope.$watch('step', (newVal) => {
    if (!$scope.partner) $scope.addExchange();
    if ($scope.exchange.user && !$scope.exchange.profile) $scope.fetchProfile();
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
