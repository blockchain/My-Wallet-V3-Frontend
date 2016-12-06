angular
  .module('walletApp')
  .controller('CoinifyController', CoinifyController);

function CoinifyController ($scope, $filter, $q, MyWallet, Wallet, MyWalletHelpers, Alerts, currency, $uibModalInstance, trade, buyOptions, $timeout, $interval, formatTrade, buySell, $rootScope, $cookies, $window) {
  $scope.settings = Wallet.settings;
  $scope.btcCurrency = $scope.settings.btcCurrency;
  $scope.currencies = currency.coinifyCurrencies;
  $scope.user = Wallet.user;
  $scope.trades = buySell.trades;
  $scope.alerts = [];
  $scope.status = {};
  $scope.trade = trade;
  $scope.quote = buyOptions.quote;

  let links = ['https://blockchain.co1.qualtrics.com/SE/?SID=SV_8pupOEQPGkXx8Kp',
               'https://blockchain.co1.qualtrics.com/SE/?SID=SV_4ZuHusilGeNWm6V',
               'https://blockchain.co1.qualtrics.com/SE/?SID=SV_1RF9VhC96M8xXh3'];

  $scope.buySellDebug = $rootScope.buySellDebug;

  let accountIndex = $scope.trade && $scope.trade.accountIndex ? $scope.trade.accountIndex : MyWallet.wallet.hdwallet.defaultAccount.index;
  $scope.label = MyWallet.wallet.hdwallet.accounts[accountIndex].label;

  let exchange = buySell.getExchange();
  $scope.exchange = exchange && exchange.profile ? exchange : {profile: {}};

  $scope.isKYC = $scope.trade && $scope.trade.constructor.name === 'CoinifyKYC';
  $scope.needsKyc = () => $scope.isMedium('bank') && +$scope.exchange.profile.level.name < 2;
  $scope.needsISX = () => $scope.trade && !$scope.trade.bankAccount && buySell.tradeStateIn(buySell.states.pending)($scope.trade) || $scope.isKYC;
  $scope.needsReview = () => $scope.trade && buySell.tradeStateIn(buySell.states.pending)($scope.trade);

  $scope.expiredQuote = $scope.trade && new Date() > $scope.trade.quoteExpireTime && $scope.trade.id;
  let updateBTCExpected = (quote) => { $scope.status.gettingQuote = false; $scope.btcExpected = quote; };

  let eventualError = (message) => Promise.reject.bind(Promise, { message });

  $scope.steps = {
    'email': 0,
    'accept-terms': 1,
    'select-payment-medium': 2,
    'summary': 3,
    'isx': 4,
    'trade-in-review': 5,
    'trade-formatted': 6
  };

  $scope.onStep = (...steps) => steps.some(s => $scope.step === $scope.steps[s]);
  $scope.afterStep = (step) => $scope.step > $scope.steps[step];
  $scope.beforeStep = (step) => $scope.step < $scope.steps[step];
  $scope.currentStep = () => Object.keys($scope.steps).filter($scope.onStep)[0];

  $scope.goTo = (step) => $scope.step = $scope.steps[step];

  $scope.formattedTrade = undefined;
  $scope.bitcoinReceived = buyOptions.bitcoinReceived && $scope.trade && $scope.trade.bitcoinReceived;

  $scope.fields = { email: $scope.user.email };

  $scope.transaction = trade == null
    ? ({ fiat: buyOptions.fiat, btc: buyOptions.btc, fee: 0, total: 0, currency: buyOptions.currency || buySell.getCurrency() })
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

  $scope.userHasExchangeAcct = $scope.exchange.user;

  $scope.getAccounts = () => {
    if (!$scope.exchange.user) { return; }

    let success = (accounts) => {
      $scope.accounts = accounts;
    };

    let accountsError = eventualError('ERROR_ACCOUNTS_FETCH');
    return $scope.mediums[$scope.medium].getAccounts().then(success, accountsError);
  };

  $scope.getPaymentMediums = () => {
    if (!$scope.exchange.user) { return; }

    // reset buyOptions
    buyOptions = {};

    $scope.status.waiting = true;

    let success = (mediums) => {
      $scope.mediums = mediums;
      $scope.status.waiting = false;
      $scope.medium && $scope.updateAmounts();
    };

    let mediumsError = eventualError('ERROR_PAYMENT_MEDIUMS_FETCH');
    return $scope.quote.getPaymentMediums().then(success, mediumsError);
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

    if ($scope.quote) {
      $scope.transaction.methodFee = ($scope.quote.paymentMediums[$scope.medium].fee / 100).toFixed(2);
      $scope.transaction.total = ($scope.quote.paymentMediums[$scope.medium].total / 100).toFixed(2);
    } else if ($scope.trade) {
      $scope.transaction.total = ($scope.trade.sendAmount / 100).toFixed(2);
    }
  };

  $scope.getQuote = () => {
    if ($scope.trade) { $scope.updateAmounts(); return; }
    if (buyOptions.quote) { $scope.getPaymentMediums(); return; }

    $scope.quote = null;
    $scope.status.waiting = true;
    $scope.status.gettingQuote = true;

    let quoteError = eventualError('ERROR_QUOTE_FETCH');
    let baseCurr = buyOptions.btc ? 'BTC' : $scope.transaction.currency.code;
    let quoteCurr = buyOptions.btc ? $scope.transaction.currency.code : 'BTC';
    let amount = buyOptions.btc ? -Math.round($scope.transaction.btc * 100000000) : Math.round($scope.transaction.fiat * 100);

    const success = (quote) => {
      $scope.status = {};
      $scope.expiredQuote = false;
      $scope.quote = quote;
      Alerts.clear($scope.alerts);
      if (quote.baseCurrency === 'BTC') {
        $scope.transaction.btc = quote.baseAmount / 100000000;
        $scope.transaction.fiat = -quote.quoteAmount / 100;
      } else {
        $scope.transaction.fiat = -quote.baseAmount / 100;
        $scope.transaction.btc = quote.quoteAmount / 100000000;
      }
    };

    return buySell.getExchange().getBuyQuote(amount, baseCurr, quoteCurr)
      .then(success, quoteError)
      .then($scope.getPaymentMediums)
      .then($scope.getAccounts)
      .catch($scope.standardError);
  };

  $scope.isCurrencySelected = (currency) => currency === $scope.transaction.currency;

  $scope.nextStep = () => {
    if (!$scope.trade) {
      if ((!$scope.user.isEmailVerified || $scope.rejectedEmail) && !$scope.exchange.user) {
        $scope.goTo('email');
      } else if (!$scope.exchange.user) {
        $scope.goTo('accept-terms');
      } else if (!$scope.isMediumSelected) {
        $scope.goTo('select-payment-medium');
        $scope.isMediumSelected = true;
      } else {
        $scope.goTo('summary');
      }
    } else {
      if ($scope.needsISX() && !$scope.formattedTrade) {
        $scope.goTo('isx');
      } else if ($scope.needsReview()) {
        $scope.goTo('trade-in-review');
      } else {
        $scope.goTo('trade-formatted');
      }
    }
  };

  $scope.isDisabled = () => {
    if ($scope.onStep('accept-terms')) {
      return !$scope.signupForm.$valid;
    } else if ($scope.onStep('select-payment-medium')) {
      return !$scope.quote || !$scope.medium;
    } else if ($scope.onStep('summary')) {
      return $scope.editAmount || !$scope.limits.max;
    }
  };

  $scope.watchAddress = () => {
    if ($rootScope.buySellDebug) {
      console.log('$scope.watchAddress() for', $scope.trade);
    }
    if (!$scope.trade || $scope.bitcoinReceived || $scope.isKYC) return;
    const success = () => $timeout(() => $scope.bitcoinReceived = true);
    $scope.trade.watchAddress().then(success);
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
    $rootScope.$broadcast('fetchExchangeProfile');
    $uibModalInstance.dismiss('');
    $scope.trade = null;
  };

  $scope.close = () => {
    let text, action, link, index;
    let surveyOpened = $cookies.getObject('survey-opened');

    if (!$scope.exchange.user) index = 0;
    else if (!$scope.trades.length && !$scope.trade) index = 1;
    else index = 2;

    link = links[index];

    let hasSeenPrompt = surveyOpened && surveyOpened.index >= index;

    if (hasSeenPrompt) {
      [text, action] = ['CONFIRM_CLOSE_BUY', 'IM_DONE'];
      Alerts.confirm(text, {action: action}).then($scope.cancel);
    } else {
      [text, action] = ['COINIFY_SURVEY', 'TAKE_SURVEY'];
      let openSurvey = () => {
        $scope.cancel();
        $window.open(link);
        $cookies.putObject('survey-opened', {index: index});
      };
      Alerts.confirm(text, {action: action, friendly: true, cancel: 'NO_THANKS'}).then(openSurvey, $scope.cancel);
    }
  };

  $scope.getQuoteHelper = () => {
    if ($scope.quote && !$scope.expiredQuote && $scope.beforeStep('trade-formatted')) return 'AUTO_REFRESH';
    else if ($scope.quote && !$scope.quote.id) return 'EST_QUOTE_1';
    else if ($scope.expiredQuote) return 'EST_QUOTE_2';
    else return 'RATE_WILL_EXPIRE';
  };

  $scope.fakeBankTransfer = () => $scope.trade.fakeBankTransfer().then(() => {
    $scope.formatTrade('processing');
    $scope.$digest();
  });

  $scope.$watch('medium', (newVal) => newVal && $scope.getAccounts().then($scope.updateAmounts));
  $scope.$watchGroup(['exchange.user', 'paymentInfo', 'formattedTrade'], $scope.nextStep);
  $scope.$watch('user.isEmailVerified', () => $scope.onStep('email') && $scope.nextStep());
  $scope.$watch('bitcoinReceived', (newVal) => newVal && ($scope.formattedTrade = formatTrade['success']($scope.trade)));

  $scope.$watch('expiredQuote', (newVal) => {
    if (newVal && !$scope.isKYC) {
      $scope.status.gettingQuote = true;
      if (!$scope.trade) $scope.getQuote();
      else $scope.trade.btcExpected().then(updateBTCExpected);
    }
  });
}
