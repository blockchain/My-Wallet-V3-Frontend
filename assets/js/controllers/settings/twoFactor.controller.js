angular
  .module('walletApp')
  .controller("TwoFactorCtrl", TwoFactorCtrl);

function TwoFactorCtrl($scope, Wallet, Alerts, $uibModalInstance, $translate, $timeout) {
  $scope.settings = Wallet.settings;
  $scope.user = Wallet.user;

  let steps = ['disable', 'disabled', 'enable', 'configure_mobile', 'pair', 'confirm_sms', 'success', 'loading', 'error'];
  $scope.step = $scope.settings.needs2FA ? 'disable' : 'enable';

  $scope.pairWith = 'authenticator';
  $scope.fields = {
    authenticatorCode: '',
    yubiKeyCode: ''
  };
  $scope.mobileNumber = {
    step: 1
  };

  if (Wallet.user.internationalMobileNumber.length > 4 && !Wallet.user.isMobileVerified) {
    $scope.mobileNumber.step = 2;
  }

  $scope.errors = {};
  $scope.status = {};
  $scope.alerts = [];

  $scope.closeAlert = (alert) => {
    Alerts.close(alert, $scope.alerts);
  };

  $scope.displayConfirmationError = () => {
    Alerts.displayError('2FA_INVALID', false, $scope.alerts);
  };

  $scope.validateCode = (pairWith) => {
    if (pairWith === 'yubiKey') {
      return $scope.fields.yubiKeyCode.length > 0;
    } else if (pairWith === 'authenticator') {
      return $scope.fields.authenticatorCode.length === 6;
    } else {
      return false;
    }
  };

  $scope.disableTwoFactor = () => {
    if (!$scope.settings.needs2FA) return;
    Wallet.disableSecondFactor();
    $scope.goToStep('disabled');
    Wallet.saveActivity(2);
  };

  $scope.setTwoFactorSMS = () => {
    if ($scope.user.isMobileVerified) {
      Wallet.setTwoFactorSMS();
    }
  };

  $scope.setTwoFactorGoogleAuthenticator = () => {
    Wallet.setTwoFactorGoogleAuthenticator();
  };

  $scope.confirmTwoFactorGoogleAuthenticator = (code) => {
    const success = () => {
      if (!$scope.isStep('pair')) return;
      $scope.goToStep('success');
    };
    const error = () => {
      $scope.displayConfirmationError();
      $scope.errors.authenticatorCode = true;
      $scope.status.loading = false;
    };
    Wallet.confirmTwoFactorGoogleAuthenticator(code, success, error);
  };

  $scope.setTwoFactorYubiKey = (key) => {
    const success = () => {
      if (!$scope.isStep('pair')) return;
      $scope.goToStep('success');
    };
    const error = () => {
      $scope.errors.yubiKeyCode = true;
      $scope.status.loading = false;
    };
    Wallet.setTwoFactorYubiKey(key, success, error);
  };

  $scope.pairWithApp = (pairWith) => {
    if (!$scope.validateCode(pairWith)) return;
    if (pairWith === 'yubiKey') {
      $scope.setTwoFactorYubiKey($scope.fields.yubiKeyCode);
    } else if (pairWith === 'authenticator') {
      $scope.confirmTwoFactorGoogleAuthenticator($scope.fields.authenticatorCode);
    } else {
      $scope.goToStep('error');
    }
    $scope.status.loading = true;
  };

  $scope.goToStep = (step) => {
    if (steps.indexOf(step) < 0) return;
    $scope.$root.$safeApply($scope);
    $scope.step = step;
  };

  $scope.isStep = (step) => {
    return $scope.step === step;
  };

  $scope.authWithPhone = () => {
    if ($scope.user.isMobileVerified) {
      $scope.goToStep('loading');
      $scope.setTwoFactorSMS();
    } else {
      $scope.goToStep('configure_mobile');
    }
  };

  $scope.authWithApp = () => {
    $scope.goToStep('pair');
    $scope.setTwoFactorGoogleAuthenticator();
  };

  $scope.close = () => {
    Alerts.clear();
    $uibModalInstance.dismiss("");
  };

  $scope.$watch('user.isMobileVerified', (newVal, oldVal) => {
    if (newVal && $scope.isStep('configure_mobile')) {
      $scope.goToStep('loading');
      $scope.setTwoFactorSMS();
    }
  });

  $scope.$watch('settings.twoFactorMethod', (newVal, oldVal) => {
    if (!$scope.isStep('loading')) return;
    if (newVal > 0) {
      $scope.goToStep('success');
      Wallet.saveActivity(2);
    } else {
      $scope.goToStep('disabled');
    }
  });

}
