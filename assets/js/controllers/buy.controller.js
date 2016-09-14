angular
  .module('walletApp')
  .controller('BuyCtrl', BuyCtrl);

function BuyCtrl ($scope, $filter, $q, MyWallet, Wallet, MyWalletHelpers, Alerts, currency, $uibModalInstance, transaction, trade, $timeout, $interval, bitcoinReceived, formatTrade, buySell, $rootScope) {
  $scope.settings = Wallet.settings;
  $scope.btcCurrency = $scope.settings.btcCurrency;
  $scope.currencies = currency.coinifyCurrencies;
  $scope.user = Wallet.user;
  $scope.trades = buySell.trades;
  $scope.alerts = [];
  $scope.status = {};
  $scope.trade = trade;

  $scope.buySellDebug = $rootScope.buySellDebug;

  let accountIndex = $scope.trade && $scope.trade.accountIndex ? $scope.trade.accountIndex : MyWallet.wallet.hdwallet.defaultAccount.index;
  $scope.label = MyWallet.wallet.hdwallet.accounts[accountIndex].label;

  $scope.method = $scope.trade ? $scope.trade.medium : 'card';
  $scope.methods = {};
  $scope.getMethod = () => $scope.methods[$scope.method] || {};
  $scope.isMedium = (medium) => $scope.getMethod().inMedium === medium;

  let exchange = buySell.getExchange();
  $scope.exchange = exchange && exchange.profile ? exchange : {profile: {}};

  $scope.isKYC = $scope.trade && $scope.trade.constructor.name === 'CoinifyKYC';
  $scope.needsKyc = () => $scope.isMedium('bank') && +$scope.exchange.profile.level.name < 2;
  $scope.needsIST = () => buySell.resolveState($scope.trade.state) === 'pending' || $scope.isKYC;

  let fifteenMinutesAgo = new Date(new Date().getTime() - 15 * 60 * 1000);
  $scope.expiredQuote = $scope.trade && fifteenMinutesAgo > $scope.trade.createdAt && $scope.trade.id;
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
  $scope.bitcoinReceived = bitcoinReceived || $scope.trade && $scope.trade.bitcoinReceived;

  $scope.fields = { email: $scope.user.email, countryCode: $scope.exchange.profile.country };
  let txTemplate = { fiat: 0, btc: 0, fee: 0, total: 0, currency: buySell.getCurrency($scope.trade) };
  $scope.transaction = Object.assign({}, txTemplate, transaction);

  $scope.changeCurrencySymbol = (curr) => { $scope.currencySymbol = currency.conversions[curr.code]; };
  $scope.changeCurrencySymbol($scope.transaction.currency);

  $timeout(() => !$scope.isKYC && $scope.changeCurrency($scope.transaction.currency));
  $timeout(() => $scope.rendered = true, bitcoinReceived ? 0 : 4000);

  $scope.hideQuote = () => (
    $scope.afterStep('trade-complete') ||
    $scope.isMedium('bank') ||
    $scope.expiredQuote || ($scope.quote && !$scope.quote.id && !$scope.trade)
  );

  $scope.userHasExchangeAcct = $scope.trades.pending.length || $scope.trades.completed.length;

  $scope.getPaymentMethods = () => {
    if (!$scope.exchange.user) { return; }

    $scope.status.waiting = true;

    let success = (methods) => {
      $scope.methods = {
        card: methods.filter((m) => m.inMedium === 'card')[0],
        bank: methods.filter((m) => m.inMedium === 'bank')[0]
      };
    };

    // TODO: use quote.paymentMethods to populate the list of methods. Fees
    //       have already been calculated.
    return $scope.exchange.getPaymentMethods($scope.transaction.currency.code, 'BTC')
      .then(success).then(() => $scope.getQuote());
  };

  $scope.changeCurrency = (curr) => {
    if (!curr) curr = buySell.getCurrency();
    if ($scope.trade && !$scope.isKYC) curr = {code: $scope.trade.inCurrency};
    $scope.transaction.currency = curr;
    $scope.changeCurrencySymbol(curr);
    $scope.getPaymentMethods();
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

    if ($scope.quote && $scope.quote.id) {
      $scope.transaction.methodFee = ($scope.quote.paymentMethods[$scope.method].fee / 100).toFixed(2);
      $scope.transaction.total = ($scope.quote.paymentMethods[$scope.method].total / 100).toFixed(2);
    } else if ($scope.trade) {
      $scope.transaction.total = ($scope.trade.sendAmount / 100).toFixed(2);
    }
  };

  $scope.getQuote = () => {
    if ($scope.trade) { $scope.updateAmounts(); return; }

    $scope.quote = null;
    $scope.transaction.btc = 0;
    $scope.status.gettingQuote = true;
    if (!$scope.transaction.fiat) { $scope.status = {}; return; }

    let quote;
    if ($scope.userHasExchangeAcct) {
      quote = $scope.exchange.getBuyQuote(Math.trunc($scope.transaction.fiat * 100), $scope.transaction.currency.code);
    } else {
      quote = exchange.getBuyQuote(Math.trunc($scope.transaction.fiat * 100), $scope.transaction.currency.code);
    }

    let getPaymentMethods = (quote) => {
      return quote.getPaymentMethods();
    };

    const setQuote = (quote) => {
      $scope.quote = quote;
      return quote;
    };

    const success = () => {
      $scope.status = {};
      $scope.expiredQuote = false;
      $scope.updateAmounts();
      Alerts.clear($scope.alerts);
      $scope.transaction.btc = currency.formatCurrencyForView($scope.quote.quoteAmount / 100000000, currency.bitCurrencies[0]);
    };

    if ($scope.exchange.user) {
      return quote.then(setQuote).then(getPaymentMethods).then(success, $scope.standardError);
    } else {
      return quote.then(setQuote).then(success, $scope.standardError);
    }
  };

  $scope.toggleEmail = () => $scope.editEmail = !$scope.editEmail;
  $scope.isCurrencySelected = (currency) => currency === $scope.transaction.currency;

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
    } else if (!$scope.paymentInfo && !$scope.formattedTrade && $scope.needsIST()) {
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

    if ($scope.exchange.user && $scope.afterStep('select-payment-method')) {
      $scope.goTo('select-payment-method');
    } else if ($scope.exchange.user) {
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

  $scope.confirmOrContinue = () => {
    let bankBuyMax = $scope.exchange.profile.currentLimits.bank.inRemaining;
    let belowBuyLimit = transaction.fiat <= bankBuyMax;
    let skipConfirm = $scope.needsKyc() || (belowBuyLimit && $scope.isMedium('bank'));
    skipConfirm ? $scope.buy() : $scope.goTo('summary');
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
    $scope.exchange = buySell.getExchange();

    return $scope.exchange.signup($scope.fields.countryCode, $scope.transaction.currency.code)
      .then(() => $scope.fetchProfile())
      .then(() => $scope.getPaymentMethods())
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
      $scope.nextStep();
    };

    // check if bank transfer and kyc level
    if ($scope.needsKyc()) {
      return buySell.getOpenKYC().then(success, $scope.standardError);
    }

    $scope.exchange.buy($scope.transaction.fiat * 100, $scope.transaction.currency.code, $scope.getMethod().inMedium)
                   .then(success, $scope.standardError)
                   .then($scope.watchAddress);
  };

  $scope.formatTrade = (tx, state) => {
    if ($scope.needsKyc()) {
      buySell.pollingLevel = true;
      return buySell.pollUserLevel().then($scope.buy).finally(() => $scope.pollingLevel = false);
    }

    if ($scope.isKYC || $scope.needsKyc()) state = 'kyc';
    $scope.formattedTrade = formatTrade[state](tx, $scope.trade);
  };

  if ($scope.trade && !$scope.needsIST()) {
    let state = $scope.trade.state;
    if (!bitcoinReceived) $scope.watchAddress();

    $scope.formattedTrade = formatTrade[state]({id: $scope.trade.iSignThisID}, $scope.trade);
  }

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

  $scope.getQuoteHelper = () => {
    if ($scope.quote && !$scope.expiredQuote && $scope.beforeStep('trade-formatted')) return 'AUTO_REFRESH';
    else if ($scope.quote && !$scope.quote.id) return 'EST_QUOTE_1';
    else if ($scope.expiredQuote) return 'EST_QUOTE_2';
    else return 'RATE_WILL_EXPIRE';
  };

  $scope.$watch('method', $scope.updateAmounts);
  $scope.$watchGroup(['exchange.user', 'paymentInfo', 'formattedTrade'], $scope.nextStep);

  $scope.$watch('user.isEmailVerified', () => {
    if ($scope.onStep('email')) $scope.nextStep();
  });

  $scope.$watch('bitcoinReceived', (newVal) => {
    if (newVal) $scope.formattedTrade = formatTrade['success']({id: trade.iSignThisID}, trade);
  });

  $scope.$watch('expiredQuote', (newVal) => {
    if (newVal && !$scope.isKYC && $scope.exchange.user) {
      $scope.status.gettingQuote = true;
      if (!$scope.trade) $scope.getQuote();
      else $scope.trade.btcExpected().then(updateBTCExpected);
    }
  });

  $scope.$watch('step', (newVal) => {
    if ($scope.exchange.user && !$scope.exchange.profile) $scope.fetchProfile().catch($scope.standardError);
    if ($scope.steps['email'] === newVal && !Wallet.goal.firstLogin) Wallet.resendEmailConfirmation();
  });

  $scope.$watch('quote.expiresAt', (newVal) => {
    if (!$scope.quote || !$scope.exchange.user) return;

    let expiresAt = new Date($scope.quote.expiresAt);
    if (new Date() > expiresAt) {
      $scope.quote = null;
      $scope.getQuote();
    }
  });

  $scope.$watch('transaction.currency.code + transaction.fiat', () => {
    // Only needed for anonymous quotes...
    if ($scope.exchange && $scope.exchange.user) return;

    if (
      !$scope.quote ||
      !$scope.transaction ||
      !transaction.currency ||
      $scope.transaction.currency.code !== $scope.quote.baseCurrency ||
      Math.round($scope.transaction.fiat * 100) !== -$scope.quote.baseAmount
    ) {
      $scope.getQuote();
    }
  });

  $scope.initBuy = () => {
    $uibModalInstance.dismiss('');
    $timeout(() => buySell.openBuyView());
  };
}
