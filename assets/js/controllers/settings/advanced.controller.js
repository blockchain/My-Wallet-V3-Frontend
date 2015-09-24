angular
  .module('walletApp')
  .controller("SettingsAdvancedCtrl", SettingsAdvancedCtrl);

function SettingsAdvancedCtrl($scope, Wallet, $modal, $translate) {
  $scope.settings = Wallet.settings;
  $scope.btc = Wallet.btcCurrencies[0];
  $scope.processToggleRememberTwoFactor = null;
  $scope.errors = {
    ipWhitelist: null
  };

  $scope.validateFee = (candidate) => {
    let n = parseInt(candidate);
    return !isNaN(candidate) && n > 0 && n <= 1000000;
  };
  $scope.validatePbkdf2 = (candidate) => {
    let n = parseInt(candidate);
    return !isNaN(candidate) && n >= 1 && n <= 20000;
  };
  $scope.validateLogoutTime = (candidate) => {
    let n = parseInt(candidate);
    return !isNaN(candidate) && n >= 1 && n <= 1440;
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

  $scope.changeFeePerKB = (fee, successCallback) => {
    Wallet.setFeePerKB(fee);
    successCallback();
  };

  $scope.changePbkdf2 = (n, successCallback, errorCallback) => {
    const error = () => {
      Wallet.displayError("Failed to update PBKDF2 iterations");
      errorCallback();
    };
    Wallet.setPbkdf2Iterations(n, successCallback, error, errorCallback);
  };

  $scope.changeLogoutTime = (m, success, errorCallback) => {
    const error = () => {
      Wallet.displayError("Failed to update auto logout time");
      errorCallback();
    };
    Wallet.setLogoutTime(m, success, error);
  };

  $scope.changeIpWhitelist = (list, success, errorCallback) => {
    const error = () => {
      Wallet.displayError("Failed to update IP whitelist");
      errorCallback();
    };
    Wallet.setIPWhitelist(list, success, error);
  };

  $scope.toggleApiAccess = () => {
    Wallet.setApiAccess(!$scope.settings.apiAccess);
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

}
