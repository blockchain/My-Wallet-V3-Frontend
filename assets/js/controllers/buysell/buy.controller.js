angular
  .module('walletApp')
  .controller('BuyCtrl', BuyCtrl);

function BuyCtrl ($scope, $filter, $q, MyWallet, Wallet, MyWalletHelpers, Alerts, currency, $uibModalInstance, trade, buyOptions, $timeout, $interval, formatTrade, buySell, $rootScope) {
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
  $scope.needsISX = () => !$scope.trade.bankAccount && buySell.resolveState($scope.trade.state) === 'pending' || $scope.isKYC;

  let fifteenMinutesAgo = new Date(new Date().getTime() - 15 * 60 * 1000);
  $scope.expiredQuote = $scope.trade && fifteenMinutesAgo > $scope.trade.createdAt && $scope.trade.id;
  let updateBTCExpected = (quote) => { $scope.status.gettingQuote = false; $scope.btcExpected = quote; };

  let eventualError = (message) => Promise.reject.bind(Promise, { message });

  $scope.steps = {
    'amount': 0,
    'select-country': 1,
    'email': 2,
    'accept-terms': 3,
    'select-payment-method': 4,
    'summary': 5,
    'isx': 6,
    'trade-formatted': 7
  };

  $scope.onStep = (...steps) => steps.some(s => $scope.step === $scope.steps[s]);
  $scope.afterStep = (step) => $scope.step > $scope.steps[step];
  $scope.beforeStep = (step) => $scope.step < $scope.steps[step];
  $scope.currentStep = () => Object.keys($scope.steps).filter($scope.onStep)[0];

  $scope.goTo = (step) => $scope.step = $scope.steps[step];
  $scope.goTo('amount');

  $scope.formattedTrade = undefined;
  $scope.bitcoinReceived = buyOptions.bitcoinReceived && $scope.trade && $scope.trade.bitcoinReceived;

  $scope.fields = { email: $scope.user.email, countryCode: $scope.exchange.profile.country };

  $scope.transaction = trade == null
    ? ({ fiat: buyOptions.fiat || 0, btc: 0, fee: 0, total: 0, currency: buyOptions.currency || buySell.getCurrency() })
    : ({ fiat: $scope.trade.inAmount / 100, btc: 0, fee: 0, total: 0, currency: buySell.getCurrency($scope.trade) });

  $scope.changeCurrencySymbol = (curr) => { $scope.currencySymbol = currency.conversions[curr.code]; };
  $scope.changeCurrencySymbol($scope.transaction.currency);

  $timeout(() => !$scope.isKYC && $scope.changeCurrency($scope.transaction.currency));
  $timeout(() => $scope.rendered = true, $scope.bitcoinReceived ? 0 : 4000);

  $scope.hideQuote = () => (
    $scope.afterStep('isx') ||
    $scope.isMedium('bank') ||
    $scope.expiredQuote || ($scope.quote && !$scope.quote.id && !$scope.trade)
  );

  $scope.userHasExchangeAcct = $scope.trades.pending.length || $scope.trades.completed.length;

  $scope.getPaymentMethods = () => {
    if (!$scope.exchange.user) { return; }

    $scope.status.waiting = true;

    let success = (methods) => {
      $scope.methods = methods;
      $scope.status.waiting = false;
      $scope.updateAmounts();
    };

    let methodsError = eventualError('ERROR_PAYMENT_METHODS_FETCH');

    return $scope.quote && $scope.quote.expiresAt > new Date()
      ? $scope.quote.getPaymentMethods().then(success, methodsError)
      : $scope.getQuote();
  };

  $scope.changeCurrency = (curr) => {
    if (!curr) curr = buySell.getCurrency();
    if ($scope.trade && !$scope.isKYC) curr = {code: $scope.trade.inCurrency};
    $scope.transaction.currency = curr;
    $scope.changeCurrencySymbol(curr);
    $scope.getQuote();
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
    $scope.status.waiting = true;
    if (!$scope.transaction.fiat) { $scope.status = {}; return; }

    let quoteError = eventualError('ERROR_QUOTE_FETCH');
    let amount = Math.round($scope.transaction.fiat * 100);
    let currCode = $scope.transaction.currency.code;

    const success = (quote) => {
      $scope.status = {};
      $scope.expiredQuote = false;
      $scope.quote = quote;
      Alerts.clear($scope.alerts);
      $scope.transaction.btc = currency.formatCurrencyForView($scope.quote.quoteAmount / 100000000, currency.bitCurrencies[0]);
    };

    return buySell.getExchange().getBuyQuote(amount, currCode)
      .then(success, quoteError)
      .then($scope.getPaymentMethods)
      .catch($scope.standardError);
  };

  $scope.isCurrencySelected = (currency) => currency === $scope.transaction.currency;

  $scope.nextStep = () => {
    if (!$scope.trade) {
      if (!$scope.transaction.fiat) {
        $scope.goTo('amount');
      } else if ((!$scope.fields.countryCode && !$scope.afterStep('amount')) || ($scope.onStep('amount') && !$scope.exchange.user)) {
        $scope.goTo('select-country');
      } else if ((!$scope.user.isEmailVerified || $scope.rejectedEmail) && !$scope.exchange.user) {
        $scope.goTo('email');
      } else if (!$scope.exchange.user) {
        $scope.goTo('accept-terms');
      } else if (!$scope.isMethodSelected) {
        $scope.goTo('select-payment-method');
        $scope.isMethodSelected = true;
      } else {
        $scope.goTo('summary');
      }
    } else {
      if ($scope.needsISX() && !$scope.formattedTrade) {
        $scope.goTo('isx');
      } else {
        $scope.goTo('trade-formatted');
      }
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
    } else if ($scope.onStep('select-payment-method')) {
      return !$scope.quote;
    } else if ($scope.onStep('summary')) {
      return $scope.editAmount;
    }
  };

  $scope.confirmOrContinue = () => {
    let bankBuyMax = $scope.exchange.profile.currentLimits.bank.inRemaining;
    let belowBuyLimit = $scope.transaction.fiat <= bankBuyMax;
    let skipConfirm = $scope.needsKyc() || (belowBuyLimit && $scope.isMedium('bank'));
    skipConfirm ? $scope.buy() : $scope.goTo('summary');
  };

  $scope.signup = () => {
    $scope.status.waiting = true;
    Alerts.clear($scope.alerts);
    $scope.exchange = buySell.getExchange();

    return $scope.exchange.signup($scope.fields.countryCode, $scope.transaction.currency.code)
      .then(() => $scope.exchange.fetchProfile())
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
      $scope.trade = trade;
      Alerts.clear($scope.alerts);
      if ($scope.trade.bankAccount) $scope.formatTrade('bank_transfer');

      $scope.nextStep();
    };

    // check if bank transfer and kyc level
    if ($scope.needsKyc()) {
      return buySell.getOpenKYC().then(success, $scope.standardError);
    }

    let buyError = eventualError('ERROR_TRADE_CREATE');
    let amount = Math.round($scope.transaction.fiat * 100);

    $scope.exchange.buy(amount, $scope.transaction.currency.code, $scope.getMethod().inMedium)
                   .catch(buyError)
                   .then(success, $scope.standardError)
                   .then($scope.watchAddress);
  };

  $scope.formatTrade = (state) => {
    if ($scope.isKYC || $scope.needsKyc()) state = 'kyc';
    $scope.formattedTrade = formatTrade[state]($scope.trade);

    if ($scope.needsKyc()) {
      let poll = buySell.pollUserLevel(buySell.kycs[0]);
      $scope.$on('$destroy', poll.cancel);
      return poll.result.then($scope.buy);
    }
  };

  if ($scope.trade && !$scope.needsISX()) {
    let state = $scope.trade.state;
    if (!$scope.bitcoinReceived) $scope.watchAddress();
    if ($scope.trade.bankAccount && $scope.trade.state === 'awaiting_transfer_in') state = 'bank_transfer';

    $scope.formattedTrade = formatTrade[state]($scope.trade);
  }

  $scope.onResize = (step) => $scope.isxStep = step;

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

  $scope.fakeBankTransfer = () => $scope.trade.fakeBankTransfer().then(() => { $scope.formatTrade('processing'); });

  $scope.$watchGroup(['exchange.user', 'paymentInfo', 'formattedTrade'], $scope.nextStep);
  $scope.$watch('user.isEmailVerified', () => $scope.onStep('email') && $scope.nextStep());
  $scope.$watch('bitcoinReceived', (newVal) => newVal && ($scope.formattedTrade = formatTrade['success']($scope.trade)));

  $scope.$watch('expiredQuote', (newVal) => {
    if (newVal && !$scope.isKYC && $scope.exchange.user) {
      $scope.status.gettingQuote = true;
      if (!$scope.trade) $scope.getQuote();
      else $scope.trade.btcExpected().then(updateBTCExpected);
    }
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
      !$scope.transaction.currency ||
      $scope.transaction.currency.code !== $scope.quote.baseCurrency ||
      Math.round($scope.transaction.fiat * 100) !== -$scope.quote.baseAmount
    ) {
      $scope.getQuote();
    }
  });
}
