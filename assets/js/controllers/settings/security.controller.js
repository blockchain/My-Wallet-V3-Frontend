angular
  .module('walletApp')
  .controller("SettingsSecurityCtrl", SettingsSecurityCtrl);

function SettingsSecurityCtrl($scope, Wallet, Alerts, currency, $uibModal, $translate) {
  $scope.settings = Wallet.settings;
  $scope.user = Wallet.user;

  $scope.btc = currency.bitCurrencies[0];
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
      let errors = [
        'PASSWORD_HINT_ERROR',
        'PASSWORD_HINT_NOPASSWORD',
        'PASSWORD_HINT_NOPASSWORD2',
        'CHANGE_PASSWORD_FAILED'
      ];
      $translate(errors).then((translations) => {
        switch (err) {
          case 101:
            $scope.errors.passwordHint = translations.PASSWORD_HINT_ERROR;
            break;
          case 102:
            $scope.errors.passwordHint = translations.PASSWORD_HINT_NOPASSWORD;
            break;
          case 103:
            $scope.errors.passwordHint = translations.PASSWORD_HINT_NOPASSWORD2;
            break;
          default:
            $scope.errors.passwordHint = translations.CHANGE_PASSWORD_FAILED;
        }
      });
      errorCallback(err);
    };

    Wallet.changePasswordHint(hint, success, error);
  };

  $scope.changePassword = () => {
    $uibModal.open({
      templateUrl: "partials/settings/change-password.jade",
      controller: "ChangePasswordCtrl",
      windowClass: "bc-modal"
    });
  };

  $scope.changeTwoFactor = () => {
    $uibModal.open({
      templateUrl: "partials/settings/two-factor.jade",
      controller: "TwoFactorCtrl",
      windowClass: "bc-modal"
    });
  };

  $scope.clearErrors = () => {
    $scope.errors = {};
  };

}
