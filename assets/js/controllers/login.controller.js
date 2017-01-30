angular
  .module('walletApp')
  .controller('LoginCtrl', LoginCtrl);

function LoginCtrl ($scope, $rootScope, $window, $cookies, $state, $stateParams, $timeout, $q, Alerts, Wallet, WalletNetwork) {
  $scope.settings = Wallet.settings;
  $scope.user = Wallet.user;

  $scope.errors = {};
  $scope.status = {};
  $scope.browser = { disabled: true };

  $scope.uid = $stateParams.uid || Wallet.guid || $cookies.get('uid');
  $scope.uidAvailable = !!$scope.uid;

  if ($cookies.get('password')) {
    $scope.password = $cookies.get('password');
  }

  $scope.login = (secondPassword) => {
    $scope.status.busy = true;
    Alerts.clear();

    if ($scope.autoReload && $scope.password) {
      $cookies.put('password', $scope.password);
    }

    let success = () => {
      $state.go('wallet.common.home');
    };

    let error = (field, message) => $timeout(() => {
      $scope.status.busy = false;
      $scope.errors[field] = message;
      if (field !== 'twoFactor' && $scope.didAsk2FA) {
        $scope.didEnterCorrect2FA = true;
        $scope.errors.twoFactor = null;
      }
    });

    let needs2FA = () => $timeout(() => {
      $scope.status.busy = false;
      $scope.didAsk2FA = true;
    });

    let needsSecondPasswordCb = () => $timeout(() => {
      Wallet.askForSecondPasswordIfNeeded().then($scope.login);
    });

    $timeout(() =>
      Wallet.login(
        $scope.uid,
        $scope.password,
        {
          secondPassword,
          needsSecondPasswordCb,
          twoFactorCode: $scope.settings.needs2FA ? $scope.twoFactorCode : null,
          needsTwoFactorCb: $scope.settings.needs2FA ? () => {} : needs2FA
        }
      ).then(success, error)
    , 150);
  };

  $scope.resend = () => {
    let success = (res) => { Alerts.displaySuccess('RESENT_2FA_SMS'); };
    let error = (res) => { Alerts.displayError('RESENT_2FA_SMS_FAILED'); };

    if (Wallet.settings.twoFactorMethod === 5) {
      $scope.status.resending = true;
      let sessionToken = $cookies.get('session');
      $q.resolve(WalletNetwork.resendTwoFactorSms($scope.uid, sessionToken))
        .then(success, error).finally(() => $scope.status.resending = false);
    }
  };

  if ($scope.autoReload && $scope.uid && $scope.password) {
    $scope.login();
  }
}
