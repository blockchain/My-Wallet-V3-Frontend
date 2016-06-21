angular
  .module('walletApp')
  .controller('LoginCtrl', LoginCtrl);

function LoginCtrl ($scope, $rootScope, $location, $log, $http, Wallet, WalletNetwork, Alerts, $cookies, $uibModal, $state, $stateParams, $timeout, $translate, filterFilter, $q) {
  $scope.status = Wallet.status;
  $scope.settings = Wallet.settings;
  $scope.disableLogin = null;
  $scope.errors = {
    uid: null,
    password: null,
    twoFactor: null
  };

  $rootScope.loginFormUID.then((res) => {
    $scope.uid = $stateParams.uid || Wallet.guid || res;
    $scope.uidAvailable = !!$scope.uid;

    $scope.$watch('uid + password + twoFactorCode + settings.needs2FA', () => {
      $rootScope.loginFormUID = $q.resolve($scope.uid);
      let isValid = null;
      $scope.errors.uid = null;
      $scope.errors.password = null;
      $scope.errors.twoFactor = null;
      if ($scope.uid == null || $scope.uid === '') {
        isValid = false;
      }
      if ($scope.password == null || $scope.password === '') {
        isValid = false;
      }
      if ($scope.settings.needs2FA && $scope.twoFactorCode === '') {
        isValid = false;
      }
      if (isValid == null) {
        isValid = true;
      }
      $timeout(() => $scope.isValid = isValid);
    });
  });

  $scope.user = Wallet.user;

  $scope.browser = {disabled: true};

  $scope.twoFactorCode = '';
  $scope.busy = false;
  $scope.isValid = false;
  if ($cookies.get('password')) {
    $scope.password = $cookies.get('password');
  }
  $scope.login = () => {
    if ($scope.busy) return;
    $scope.busy = true;
    Alerts.clear();
    const error = (field, message) => {
      $scope.busy = false;
      if (field === 'uid') {
        $scope.errors.uid = 'UNKNOWN_IDENTIFIER';
      } else if (field === 'password') {
        $scope.errors.password = message;
      } else if (field === 'twoFactor') {
        $scope.errors.twoFactor = message;
      }
      if (field !== 'twoFactor' && $scope.didAsk2FA) {
        $scope.didEnterCorrect2FA = true;
      }
    };
    const needs2FA = () => {
      $scope.busy = false;
      $scope.didAsk2FA = true;
    };
    const success = (guid) => {
      $scope.busy = false;
      if ($scope.autoReload && $cookies.get('reload.url')) {
        $location.url($cookies.get('reload.url'));
        $cookies.remove('reload.url');
      }
    };
    if ($scope.settings.needs2FA) {
      Wallet.login($scope.uid, $scope.password, $scope.twoFactorCode, () => {}, success, error);
    } else {
      Wallet.login($scope.uid, $scope.password, null, needs2FA, success, error);
    }
    if ($scope.autoReload && $scope.password != null && $scope.password !== '') {
      $cookies.put('password', $scope.password);
    }
  };

  if ($scope.autoReload && $scope.uid && $scope.password) {
    $scope.login();
  }

  $scope.resend = () => {
    if (Wallet.settings.twoFactorMethod === 5) {
      $scope.resending = true;
      const success = (res) => {
        $scope.resending = false;
        Alerts.displaySuccess('RESENT_2FA_SMS');
        $rootScope.$safeApply();
      };
      const error = (res) => {
        Alerts.displayError('RESENT_2FA_SMS_FAILED');
        $scope.resending = false;
        $rootScope.$safeApply();
      };

      // The resend button is only visible after a login call has been made,
      // so we know for sure this cookie is set. The uid can't be changed,
      // so we know the session corresponds to the uid.
      let sessionToken = $cookies.get('session');
      WalletNetwork.resendTwoFactorSms($scope.uid, sessionToken).then(success).catch(error);
    }
  };

  $scope.register = () => {
    $state.go('public.signup');
  };

  $scope.numberOfActiveAccounts = () => {
    filterFilter(Wallet.accounts(), {
      archived: false
    }).length;
  };
  $scope.$watch('status.isLoggedIn', (newValue) => {
    if (newValue) {
      $scope.busy = false;
      $state.go('wallet.common.home');
    }
  });
}
