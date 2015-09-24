angular
  .module('walletApp')
  .controller("SettingsMyDetailsCtrl", SettingsMyDetailsCtrl);

function SettingsMyDetailsCtrl($scope, Wallet, $modal, $filter, $translate) {
  $scope.user = Wallet.user;
  $scope.settings = Wallet.settings;

  $scope.edit = {
    email: false,
    password: false,
    passwordHint: false
  };
  $scope.errors = {};
  $scope.mobileNumber = {
    step: 0
  };

  $scope.changeEmail = (email, success, error) => {
    Wallet.changeEmail(email, success, error);
  };

  $scope.changePasswordHint = (hint, successCallback, errorCallback) => {
    const success = () => {
      $scope.clearErrors();
      successCallback();
    };
    const error = (err) => {
      if (err === 101) {
        $translate('PASSWORD_HINT_ERROR').then((translation) => {
          $scope.errors.passwordHint = translation;
        });
      }
      errorCallback(err);
    };

    Wallet.changePasswordHint(hint, success, error);
  };

  $scope.changePassword = () => {
    let modalInstance = $modal.open({
      templateUrl: "partials/settings/change-password.jade",
      controller: "ChangePasswordCtrl",
      windowClass: "bc-modal"
    });
    if (modalInstance != null) {
      modalInstance.opened.then(() => {
        Wallet.store.resetLogoutTimeout();
      });
    }
  };

  $scope.changeTwoFactor = () => {
    let modalInstance = $modal.open({
      templateUrl: "partials/settings/two-factor.jade",
      controller: "TwoFactorCtrl",
      windowClass: "bc-modal"
    });
    if (modalInstance != null) {
      modalInstance.opened.then(() => {
        Wallet.store.resetLogoutTimeout();
      });
    }
  };

  $scope.clearErrors = () => {
    $scope.errors = {};
  };

}
