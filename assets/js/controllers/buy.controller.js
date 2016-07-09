angular
  .module('walletApp')
  .controller('BuyCtrl', BuyCtrl);

function BuyCtrl ($scope, MyWallet, Wallet, Alerts, currency, $uibModalInstance, $uibModal, country, exchange, trades, fiat) {
  $scope.fiatCurrency = Wallet.settings.currency;
  $scope.btcCurrency = Wallet.settings.btcCurrency;
  $scope.currencies = currency.currencies;
  $scope.profile = MyWallet.wallet.profile;
  $scope.allSteps = trades.length < 1;
  $scope.settings = Wallet.settings;
  $scope.countries = country;
  $scope.user = Wallet.user;
  $scope.exchange = exchange;
  $scope.trades = trades;
  $scope.alerts = [];
  $scope.status = {};
  $scope.step = 0;

  $scope.fields = { email: $scope.user.email };
  $scope.bank = { name: 'Bank Account', fee: 0 };
  $scope.creditcard = { name: 'Credit/Debit Card', fee: 2.75 };
  $scope.method = $scope.creditcard;
  $scope.transaction = {fiat: 0, btc: 0, fee: 0, total: 0};
  $scope.transaction.fiat = fiat || 0;

  $scope.standardError = (err) => {
    $scope.status = {};
    try {
      let e = JSON.parse(err);
      let msg = e.error.toUpperCase();
      if (msg === 'EMAIL_ADDRESS_IN_USE') $scope.rejectedEmail = true;
      else Alerts.displayError(msg, true, $scope.alerts, {user: $scope.exchange.user});
    } catch (e) {
      Alerts.displayError('INVALID_REQUEST', true, $scope.alerts);
    }
  };

  $scope.fetchProfile = () => {
    $scope.status.waiting = true;

    const success = () => {
      $scope.status = {};
      $scope.nextStep();
    };

    return $scope.exchange.fetchProfile().then(success, $scope.standardError);
  };

  $scope.updateAmounts = () => {
    if (!$scope.quote) return;
    if (!$scope.exchange && !$scope.exchange.user) return;
    let fiatAmt = $scope.transaction.fiat;
    let methodFee = fiatAmt * ($scope.method.fee / 100);

    $scope.transaction.methodFee = methodFee.toFixed(2);
    $scope.transaction.btc = currency.formatCurrencyForView($scope.quote.quoteAmount / 10000, currency.bitCurrencies[0]);
    $scope.transaction.total = fiatAmt +
                               +$scope.transaction.methodFee;
  };

  $scope.verifyConfirmationCode = (code, successCallback, errorCallback) => {
    const success = () => {
      $scope.user.isEmailVerified = true;
      successCallback();
      $scope.nextStep();
    };

    const error = (err) => $scope.standardError(err); errorCallback();

    Wallet.verifyEmail($scope.confirmationCode.bcAsyncForm.input.$viewValue, success, error);
  };

  // move to directive
  $scope.getQuote = () => {
    if (!$scope.exchange) return;
    if (!$scope.exchange.user) return;

    $scope.transaction.btc = 0;
    $scope.quote = null;

    let amt = $scope.transaction.fiat * 100;
    let curr = $scope.fiatCurrency.code;
    if (!amt) return;
    $scope.status.waiting = true;

    const success = (quote) => {
      $scope.status = {};
      $scope.quote = quote;
      $scope.updateAmounts();
    };

    $scope.exchange.getQuote(amt, curr).then(success, $scope.standardError);
  };

  $scope.toggleEmail = () => $scope.editEmail = !$scope.editEmail;

  $scope.addExchange = () => {
    if (!$scope.profile.countryCode) return;
    if (!MyWallet.wallet.external.coinify) MyWallet.wallet.external.addCoinify();
    $scope.exchange = MyWallet.wallet.external.coinify;
    $scope.partner = 'Coinify';
  };

  $scope.nextStep = () => {
    if (!$scope.transaction.fiat) {
      $scope.step = 0;
    } else if (!$scope.profile.countryCode) {
      $scope.step = 1;
    } else if (!$scope.user.isEmailVerified) {
      $scope.step = 2;
    } else if ($scope.rejectedEmail) {
      $scope.step = 2;
    } else if (!$scope.exchange.user) {
      $scope.step = 3;
    } else {
      $scope.step = 4;
    }
  };

  $scope.prevStep = () => {
    if ($scope.step > 0) {
      if ($scope.exchange) $scope.step = 0;
      else $scope.step--;
    }
  };

  $scope.isDisabled = () => {
    if ($scope.step === 0) {
      return !($scope.transaction.fiat > 0);
    } else if ($scope.step === 1) {
      return !$scope.profile.countryCode;
    } else if ($scope.step === 3) {
      return !$scope.signupForm.$valid;
    }
  };

  $scope.changeEmail = (email, successCallback, errorCallback) => {
    const success = () => $scope.editEmail = false; successCallback();
    const error = () => $scope.editEmail = false; errorCallback();

    $scope.rejectedEmail = undefined;

    Wallet.changeEmail(email, success, error);
  };

  $scope.signup = () => {
    $scope.status.waiting = true;

    const success = () => {
      $scope.status = {};
      $scope.fetchProfile().then($scope.getQuote);
    };

    $scope.exchange.signup()
      .then(success).catch($scope.standardError);
  };

  $scope.buy = () => {
    $scope.status.waiting = true;

    const success = (trade) => {
      $scope.status = {};

      let iSignThisProps = {
        trade: trade,
        method: $scope.method,
        trades: $scope.trades,
        partner: $scope.partner,
        transaction: $scope.transaction,
        currencySymbol: $scope.currencySymbol
      };

      $uibModal.open({
        templateUrl: 'partials/isignthis-modal.jade',
        backdrop: 'static',
        keyboard: false,
        controller: 'iSignThisCtrl',
        windowClass: 'bc-modal coinify',
        resolve: { iSignThisProps: iSignThisProps }
      });
    };

    $scope.exchange.buy($scope.transaction.fiat).then(success, $scope.standardError);
  };

  $scope.cancel = () => $uibModalInstance.dismiss('');
  $scope.close = () => Alerts.confirm('ARE_YOU_SURE_CANCEL', {}, '', 'IM_DONE').then($scope.cancel);

  $scope.changeCurrency = (curr) => {
    const error = () => { };
    const success = () => { $scope.fiatCurrency = curr; };

    Wallet.changeCurrency(curr).then(success, error);
  };

  $scope.isCurrencySelected = (currency) => currency === $scope.fiatCurrency;

  $scope.$watch('method', $scope.updateAmounts);
  $scope.$watch('transation.fiat', $scope.getQuote);

  $scope.$watch('user.isEmailVerified', (newVal) => {
    $scope.user.isEmailVerified = newVal;
    $scope.nextStep();
  });

  $scope.$watch('fiatCurrency', () => {
    let curr = $scope.fiatCurrency || null;
    $scope.currencySymbol = currency.conversions[curr.code];
  });

  $scope.$watch('step', () => {
    if ($scope.step === 0) return;
    if (!$scope.partner) $scope.addExchange();
    if ($scope.exchange && $scope.exchange.user) $scope.fetchProfile();
  });

  $scope.$on('disableAllSteps', () => $scope.allSteps = false);
}
