angular
  .module('walletApp')
  .controller("SettingsSecurityCtrl", SettingsSecurityCtrl);

function SettingsSecurityCtrl($scope, Wallet, Alerts, $uibModal, $translate) {
  $scope.settings = Wallet.settings;
  $scope.user = Wallet.user;

  $scope.btc = Wallet.btcCurrencies[0];
  $scope.processToggleRememberTwoFactor = null;

  $scope.display = {advanced: false}

  $scope.toggleAdvanced = () => {
    $scope.display.advanced = !$scope.display.advanced;
  }

  $scope.edit = {
    password: false,
    passwordHint: false
  };

  $scope.errors = {
    ipWhitelist: null
  };

  $scope.validateIpWhitelist = (candidates) => {
    $scope.errors.ipWhitelist = null;
    if (candidates == null) return false;
    if (candidates === "") return true;
    if (candidates.length > 255) {
      $translate("MAX_CHARACTERS", {
        max: 255
      }).then((translation) => {
        $scope.errors.ipWhitelist = translation;
      });
      return false;
    }
    let candidatesArray = candidates.split(",");
    if (candidatesArray.length > 16) {
      $translate("MAX_IP_ADDRESSES", {
        max: 16
      }).then((translation) => {
        $scope.errors.ipWhitelist = translation;
      });
      return false;
    }
    for (let candidate of candidatesArray) {
      if (candidate.trim() === "%.%.%.%") {
        $translate("NOT_ALLOWED", {
          forbidden: "%.%.%.%"
        }).then((translation) => {
          $scope.errors.ipWhitelist = translation;
        });
        return false;
      }
      let digits_or_wildcards = candidate.trim().split(".");
      if (digits_or_wildcards.length !== 4) return false;
      for (let digit_or_wildcard of digits_or_wildcards) {
        if (digit_or_wildcard === "%") {
        } else {
          let digit = parseInt(digit_or_wildcard);
          if (isNaN(digit) || digit < 0 || digit > 255) return false;
        }
      }
    }
    return true;
  };

  $scope.changeIpWhitelist = (list, success, errorCallback) => {
    const error = () => {
      Alerts.displayError("Failed to update IP whitelist");
      errorCallback();
    };
    Wallet.setIPWhitelist(list, success, error);
  };


  $scope.validatePbkdf2 = (candidate) => {
    let n = parseInt(candidate);
    return !isNaN(candidate) && n >= 1 && n <= 20000;
  };

  $scope.changePbkdf2 = (n, successCallback, errorCallback) => {
    const error = () => {
      Alerts.displayError("Failed to update PBKDF2 iterations");
      errorCallback();
    };
    Wallet.setPbkdf2Iterations(n, successCallback, error, errorCallback);
  };

  $scope.toggleLogging = () => {
    let level = $scope.settings.loggingLevel === 0 ? 1 : 0;
    Wallet.setLoggingLevel(level);
  };

  $scope.enableRememberTwoFactor = () => {
    $scope.processToggleRememberTwoFactor = true;
    const success = () => {
      $scope.processToggleRememberTwoFactor = false;
      Wallet.saveActivity(2);
    };
    const error = () => {
      return $scope.processToggleRememberTwoFactor = false;
    };
    Wallet.enableRememberTwoFactor(success, error);
  };

  $scope.disableRememberTwoFactor = () => {
    $scope.processToggleRememberTwoFactor = true;
    const success = () => {
      $scope.processToggleRememberTwoFactor = false;
      Wallet.saveActivity(2);
    };
    const error = () => {
      $scope.processToggleRememberTwoFactor = false;
    };
    Wallet.disableRememberTwoFactor(success, error);
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
    let modalInstance = $uibModal.open({
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
    let modalInstance = $uibModal.open({
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
