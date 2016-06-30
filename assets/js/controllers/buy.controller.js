angular
  .module('walletApp')
  .controller('BuyCtrl', BuyCtrl);

function BuyCtrl ($scope, MyWallet, Wallet, $stateParams, Alerts, currency, $uibModalInstance, $uibModal, country, $interval) {
  $scope.fiatCurrency = Wallet.settings.currency;
  $scope.btcCurrency = Wallet.settings.btcCurrency;
  $scope.currencies = currency.currencies;
  $scope.profile = MyWallet.wallet.profile;
  $scope.settings = Wallet.settings;
  $scope.status = {loading: true};
  $scope.countries = country;
  $scope.user = Wallet.user;
  $scope.method = undefined;
  $scope.step = 0;

  $scope.fields = { email: $scope.user.email };
  $scope.bank = { name: 'Bank Account', fee: 0 };
  $scope.creditcard = { name: 'Credit Card', fee: 2.75 };
  $scope.method = $scope.creditcard;
  $scope.transaction = {fiat: 0, btc: 0, fee: 0, total: 0};

  $scope.fetchProfile = () => {
    $scope.status.waiting = true;
    if (!$scope.user.isEmailVerified) { $scope.status = {}; return; }

    const success = (msg) => {
      $scope.status = {};
      $scope.exchangeAccount = true;

      $scope.nextStep();
    };

    const error = () => { $scope.status = {}; };

    return $scope.exchange.fetchProfile().then(success, error);
  };

  $scope.updateAmounts = () => {
    let fiatAmt = $scope.transaction.fiat;
    let feePercentage = $scope.exchange.profile.level.feePercentage;
    let methodFee = fiatAmt * ($scope.method.fee / 100);
    let tradingFee = fiatAmt * (feePercentage / 100);

    $scope.transaction.tradingFee = tradingFee.toFixed(2);
    $scope.transaction.methodFee = methodFee.toFixed(2);
    $scope.transaction.btc = $scope.quote.quoteAmount / 10000;
    $scope.transaction.total = fiatAmt +
                               +$scope.transaction.methodFee +
                               +$scope.transaction.tradingFee;
  };

  $scope.getQuote = () => {
    if (!$scope.exchangeAccount) return;
    $scope.transaction.btc = 0;
    $scope.quote = null;

    let amt = $scope.transaction.fiat * 100;
    let curr = $scope.fiatCurrency.code;
    if (!amt) return;

    const success = (quote) => {
      $scope.quote = quote;
      $scope.updateAmounts();
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
    if (!$scope.transaction.fiat) {
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
      $scope.fetchProfile().then($scope.getQuote);
    };

    const error = (err) => {
      let e = JSON.parse(err);

      $scope.status = {};
      $scope.rejectedEmail = e.error === 'email_address_in_use' ? true : undefined;
    };

    $scope.exchange.signup()
      .then(success).catch(error);
  };

  $scope.buy = () => {
    $scope.status.waiting = true;

    const success = (trade) => {
      $scope.cancel();
      $scope.status = {};

      $uibModal.open({
        templateUrl: 'partials/isignthis-modal.jade',
        controller: 'iSignThisCtrl',
        windowClass: 'bc-modal coinify',
        resolve: { trade: () => { return trade; },
                   quote: () => { return $scope.quote; },
                   method: () => { return $scope.method; },
                   partner: () => { return $scope.partner; },
                   displayTotalAmount: () => { return $scope.displayTotalAmount; },
                   currencySymbol: () => { return $scope.currencySymbol; }}
      });
    };

    const error = (err) => {
      $scope.status = {};
      Alerts.displayError(err);
    };

    $scope.exchange.buy($scope.transaction.fiat).then(success, error);
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
  $scope.$watch('method', $scope.updateAmounts);

  $scope.$watch('fiatCurrency', () => {
    let curr = $scope.fiatCurrency || null;
    $scope.currencySymbol = currency.conversions[curr.code];
  });
  $scope.$watch('transaction.fiat', () => {
    let fiatAmt = $scope.transaction.fiat;
    $scope.displayFiatAmount = currency.formatCurrencyForView(fiatAmt, $scope.settings.currency, false);
  });
  $scope.$watch('transaction.total', () => {
    let total = $scope.transaction.total;
    $scope.displayTotalAmount = currency.formatCurrencyForView(total, $scope.settings.currency, false);
  });
}
