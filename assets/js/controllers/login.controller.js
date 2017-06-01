angular
  .module('walletApp')
  .controller('LoginCtrl', LoginCtrl);

function LoginCtrl ($scope, $rootScope, $window, localStorageService, $state, $stateParams, $timeout, $q, Alerts, Wallet, WalletNetwork, Env) {
  $scope.settings = Wallet.settings;
  $scope.user = Wallet.user;

  $scope.errors = {};
  $scope.status = {};
  $scope.browser = { disabled: true };

  $scope.uid = $stateParams.uid || Wallet.guid || localStorageService.get('guid');
  $scope.uidAvailable = !!$scope.uid;

  if (localStorageService.get('password')) {
    $scope.password = localStorageService.get('password');
  }

  $scope.login = () => {
    $scope.status.busy = true;
    Alerts.clear();

    if ($scope.autoReload && $scope.password) {
      localStorageService.set('password', $scope.password);
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

    $timeout(() =>
      Wallet.login(
        $scope.uid,
        $scope.password,
        $scope.settings.needs2FA ? $scope.twoFactorCode : null,
        $scope.settings.needs2FA ? () => {} : needs2FA,
        success, error
    ), 150);
  };

  $scope.resend = () => {
    let success = (res) => { Alerts.displaySuccess('RESENT_2FA_SMS'); };
    let error = (res) => { Alerts.displayError('RESENT_2FA_SMS_FAILED'); };

    if (Wallet.settings.twoFactorMethod === 5) {
      $scope.status.resending = true;
      // Safari Incognito returns nothing, but that's probably not an issue here:
      let sessionToken = localStorageService.get('session');
      $q.resolve(WalletNetwork.resendTwoFactorSms($scope.uid, sessionToken))
        .then(success, error).finally(() => $scope.status.resending = false);
    }
  };

  if ($scope.autoReload && $scope.uid && $scope.password) {
    $scope.login();
  }

  Env.then((env) => {
    $scope.showMobileLogin = env.showMobileLogin;
  });
}
