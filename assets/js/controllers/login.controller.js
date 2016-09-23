angular
  .module('walletApp')
  .controller('LoginCtrl', LoginCtrl);

function LoginCtrl ($scope, $rootScope, $window, $cookies, $state, $stateParams, $timeout, $q, Alerts, Wallet, WalletNetwork) {
  $scope.settings = Wallet.settings;
  $scope.user = Wallet.user;

  $scope.errors = {};
  $scope.status = {};
  $scope.browser = { disabled: true };

  $scope.didLogout = $window.name === 'blockchain-logout';
  $scope.canDeauth = $cookies.get('session') != null;
  $window.name = 'blockchain';

  if ($cookies.get('password')) {
    $scope.password = $cookies.get('password');
  }

  $rootScope.loginFormUID.then((res) => {
    $scope.uid = $stateParams.uid || Wallet.guid || res;
    $scope.uidAvailable = !!$scope.uid;

    if ($scope.autoReload && $scope.uid && $scope.password) {
      $scope.login();
    }

    $scope.$watch('twoFactorCode + settings.needs2FA', () => {
      $rootScope.loginFormUID = $q.resolve($scope.uid);
      $scope.errors.twoFactor = null;
    });
  });

  $scope.login = () => {
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
    ), 250);
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

  $scope.deauth = () => {
    $scope.status.deauthorizing = true;
    let sessionToken = $cookies.get('session');
    $cookies.remove('session');

    $q.resolve(Wallet.my.endSession(sessionToken))
      .then(() => $scope.deauthorized = true)
      .catch(() => { Alerts.displayError('ERROR_DEAUTH'); })
      .finally(() => $scope.status.deauthorizing = false);
  };
}
