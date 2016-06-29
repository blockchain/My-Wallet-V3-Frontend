angular
  .module('walletApp')
  .controller('BuyCtrl', BuyCtrl);

function BuyCtrl ($scope, MyWallet, Wallet, $stateParams, Alerts, currency, $uibModalInstance, $uibModal, country, $interval) {
  $scope.fiatCurrency = Wallet.settings.currency;
  $scope.btcCurrency = Wallet.settings.btcCurrency;
  $scope.currencies = currency.currencies;
  $scope.profile = MyWallet.wallet.profile;
  $scope.settings = Wallet.settings;
  $scope.countries = country;
  $scope.user = Wallet.user;
  $scope.quote = null;
  $scope.status = {loading: true};
  $scope.editEmail = undefined;
  $scope.step = 0;

  $scope.fields = { email: $scope.user.email };
  $scope.transaction = { amount: { fiat: 0, btc: 0 } };

  // move to quote countdown directive
  $scope.setQuoteCountdown = (quote) => {
    $scope.countdown = $interval(() => {
      let now = new Date();
      let expiration = new Date(quote.expiresAt);
      let diff = expiration - now;
      let time = diff / 1000 / 60;
      let minutes = parseInt(time, 10);
      let seconds = parseInt((time % 1) * 60, 10);
      if (seconds < 10) seconds = '0' + seconds;

      $scope.quoteCountdown = minutes + ':' + seconds;
    }, 1000);
  };

  // move to quote countdown directive
  $scope.resetQuoteCountdown = () => {
    $scope.quoteCountdown = undefined;
    $interval.cancel($scope.countdown);
  };

  $scope.fetchProfile = () => {
    $scope.status.waiting = true;
    if (!$scope.user.isEmailVerified) { $scope.status = {}; return; }

    const success = (msg) => {
      $scope.status = {};
      $scope.exchangeAccount = msg;

      $scope.nextStep();
    };

    const error = () => { $scope.status = {}; };

    $scope.exchange.fetchProfile().then(success, error);
  };

  $scope.getQuote = () => {
    let amt = $scope.transaction.amount.fiat * 100;
    let curr = $scope.fiatCurrency.code;
    if (!amt) {
      $scope.transaction.amount.btc = 0;
      $scope.resetQuoteCountdown();
      return;
    }

    const success = (quote) => {
      $scope.transaction.amount.btc = quote.quoteAmount / 10000;

      $scope.resetQuoteCountdown();
      $scope.setQuoteCountdown(quote);
    };

    const error = (err) => {
      Alerts.displayError(err);
    };

    $scope.exchange.getQuote(amt, curr).then(success, error);
  };

  // Fake country selection so we can show quote first
  let firstTime = !$scope.profile.countryCode;
  $scope.profile.countryCode = $scope.profile.countryCode || 'GB';
  if (!MyWallet.wallet.external.coinify) MyWallet.wallet.external.addCoinify();
  // Reset country to null if first time around
  $scope.profile.countryCode = firstTime ? null : $scope.profile.countryCode;
  $scope.exchange = MyWallet.wallet.external.coinify;
  $scope.partner = 'Coinify';
  $scope.fetchProfile();

  $scope.toggleEmail = () => $scope.editEmail = !$scope.editEmail;

  $scope.nextStep = () => {
    if (!$scope.transaction.amount.fiat) {
      $scope.step = 0;
    } else if (!$scope.profile.countryCode) {
      $scope.step = 1;
    } else if (!$scope.user.isEmailVerified) {
      $scope.step = 2;
    } else if ($scope.rejectedEmail) {
      $scope.step = 2;
    } else if (!$scope.exchangeAccount) {
      $scope.step = 3;
    } else {
      $scope.step = 4;
    }
  };

  $scope.prevStep = () => {
    if ($scope.step > 0) {
      if ($scope.exchangeAccount) $scope.step = 0;
      else $scope.step--;
    }
  };

  $scope.isDisabled = () => {
    if ($scope.step === 0) {
      return !($scope.transaction.amount.fiat > 0);
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

  $scope.verifyConfirmationCode = (code, successCallback, errorCallback) => {
    const success = () => {
      $scope.user.isEmailVerified = true;
      successCallback();
      $scope.nextStep();
    };

    const error = (err) => Alerts.displayError(err); errorCallback();

    Wallet.verifyEmail($scope.confirmationCode.bcAsyncForm.input.$viewValue, success, error);
  };

  $scope.signup = () => {
    $scope.status.waiting = true;

    const success = () => {
      $scope.status = {};
      $scope.fetchProfile();
    };

    const error = (err) => {
      let e = JSON.parse(err);

      $scope.status = {};
      $scope.rejectedEmail = e.error === 'email_address_in_use' ? true : undefined;
    };

    $scope.exchange.signup($scope.user.email, $scope.settings.currency.code)
      .then(success).catch(error);
  };

  $scope.buy = () => {
    $scope.cancel();

    $uibModal.open({
      templateUrl: 'partials/isignthis-modal.jade',
      controller: 'iSignThisCtrl',
      windowClass: 'bc-modal coinify',
      resolve: { amount: () => { return $scope.transaction.amount.fiat * 100; } }
    });
  };

  $scope.cancel = () => $uibModalInstance.dismiss('');
  $scope.close = () => Alerts.confirm('ARE_YOU_SURE_CANCEL', {}, '', 'IM_DONE').then($scope.cancel);

  $scope.changeCurrency = (curr) => {
    const error = () => { };
    const success = () => { $scope.fiatCurrency = curr; };

    Wallet.changeCurrency(curr).then(success, error);
  };

  $scope.isCurrencySelected = (currency) => currency === $scope.fiatCurrency;

  $scope.$watch('exchange', $scope.fetchProfile);
  $scope.$watch('fiatCurrency', () => {
    let curr = $scope.fiatCurrency || null;
    $scope.currencySymbol = currency.conversions[curr.code];
  });
  $scope.$watch('transaction.amount.fiat', () => {
    let amt = $scope.transaction.amount.fiat;
    $scope.displayAmount = currency.formatCurrencyForView(amt, $scope.settings.currency);
  });
}
