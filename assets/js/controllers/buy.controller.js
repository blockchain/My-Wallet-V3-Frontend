angular
  .module('walletApp')
  .controller('BuyCtrl', BuyCtrl);

function BuyCtrl ($scope, MyWallet, Wallet, $stateParams, Alerts, currency, $uibModalInstance, $uibModal, country) {
  $scope.fiatCurrency = Wallet.settings.currency;
  $scope.btcCurrency = Wallet.settings.btcCurrency;
  $scope.profile = MyWallet.wallet.profile;
  $scope.settings = Wallet.settings;
  $scope.countries = country;
  $scope.user = Wallet.user;
  $scope.quote = null;
  $scope.status = {loading: true};
  $scope.transaction = { amount: 0 };
  $scope.editEmail = undefined;

  $scope.fields = {
    email: $scope.user.email
  };

  $scope.fetchProfile = () => {
    if (!$scope.user.isEmailVerified) $scope.status = {};
    if (!$scope.user.isEmailVerified) return;

    const success = (msg) => {
      $scope.status = {};
      $scope.exchangeAccount = msg;
    };

    const error = () => {
      $scope.status = {};
    };

    $scope.exchange.fetchProfile().then(success, error);
  };

  // since country is only used to get the right exchange partner,
  // and we only have one exchange partner right now,
  // just fake this for now.
  $scope.profile.countryCode = 'US';
  if (!MyWallet.wallet.external.coinify) MyWallet.wallet.external.addCoinify();
  $scope.exchange = MyWallet.wallet.external.coinify;
  $scope.partner = 'Coinify';
  $scope.fetchProfile();

  $scope.changeEmail = (email, successCallback, errorCallback) => {
    const success = () => $scope.editEmail = false; successCallback();
    const error = () => $scope.editEmail = false; errorCallback();

    $scope.rejectedEmail = undefined;

    Wallet.changeEmail(email, success, error);
  };

  $scope.toggleEmail = () => $scope.editEmail = !$scope.editEmail;

  $scope.verifyConfirmationCode = (code, successCallback, errorCallback) => {
    const success = () => $scope.user.isEmailVerified = true; successCallback();
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

    $scope.exchange.signup($scope.user.email, undefined, $scope.settings.currency.code)
      .then(success).catch(error);
  };

  $scope.buy = () => {
    $scope.close();

    $uibModal.open({
      templateUrl: 'partials/isignthis-modal.jade',
      controller: 'iSignThisCtrl',
      windowClass: 'bc-modal coinify',
      resolve: { amount: () => { return $scope.transaction.amount; } }
    });
  };

  $scope.close = () => $uibModalInstance.dismiss('');

  $scope.$watch('exchange', $scope.fetchProfile);
}
