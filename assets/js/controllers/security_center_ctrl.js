angular.module('walletApp').controller("SettingsSecurityCenterCtrl", ($scope, Wallet, SecurityCenter, filterFilter, $modal) => {
  $scope.security = SecurityCenter.security;
  $scope.settings = Wallet.settings;
  $scope.user = Wallet.user;
  $scope.status = Wallet.status;
  $scope.transactions = Wallet.transactions;
  $scope.display = {
    action: null,
    editingEmail: false
  };
  $scope.mobileNumber = {
    step: 1
  };

  $scope.greaterThan = (prop, val) => item => item[prop] > val;

  $scope.transfer = address => {
    $modal.open({
      templateUrl: "partials/send.jade",
      controller: "SendCtrl",
      resolve: {
        paymentRequest: () => {
          return {
            fromAddress: address,
            amount: 0,
            toAccount: Wallet.accounts()[Wallet.getDefaultAccountIndex()]
          };
        }
      }
    }).opened.then(() => {
      Wallet.store.resetLogoutTimeout();
    });
  };

  $scope.toggle = action => {
    if ($scope.display.action === action) {
      $scope.display.action = null;
    } else {
      $scope.display.action = action;
    }
  };

  $scope.beginEditEmail = () => {
    $scope.display.editingEmail = true;
  };

  $scope.changeEmail = (email, success, error) => {
    const _success = () => {
      $scope.cancelEditEmail();
      success();
    };
    Wallet.changeEmail(email, _success, error);
  };

  $scope.cancelEditEmail = () => {
    $scope.display.editingEmail = false;
  };

  $scope.changePasswordHint = (hint, success, error) => {
    Wallet.changePasswordHint(hint, success, error);
  };

  $scope.$watchCollection("user", (newValue, oldValue) => {
    if (!($scope.display.action === "mobilenumber" && !$scope.user.isMobileVerified)) {
      $scope.nextAction();
    }
  });

  $scope.$watchCollection("settings", (newValue, oldValue) => {
    if (newValue.needs2FA && $scope.display.action === 'twofactor') {
      $scope.toggle('twofactor');
    }
    if (newValue.blockTOR && $scope.display.action === 'blocktor') {
      $scope.toggle('blocktor');
    }
    if ($scope.settings.googleAuthenticatorSecret === null) {
      $scope.nextAction();
    }
  });

  $scope.$watchCollection("status", (newValue, oldValue) => {
    $scope.nextAction();
  });

  $scope.changeTwoFactor = () => {
    const modalInstance = $modal.open({
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

  $scope.nextAction = () => {
    $scope.display.action = null;
    if (!$scope.user.isEmailVerified) {
      $scope.toggle('email');
    } else if (!$scope.status.didConfirmRecoveryPhrase) {
      $scope.toggle('securityphrase');
    } else if (!$scope.user.passwordHint) {
      $scope.toggle('passwordhint');
    } else if (!$scope.user.isMobileVerified) {
      $scope.toggle('mobilenumber');
    } else if (!$scope.settings.needs2FA) {
      $scope.toggle('twofactor');
    } else if (!$scope.settings.blockTOR) {
      $scope.toggle('blocktor');
    }
  };
});
