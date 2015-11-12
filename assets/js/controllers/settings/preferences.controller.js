angular
  .module('walletApp')
  .controller("SettingsPreferencesCtrl", SettingsPreferencesCtrl);

function SettingsPreferencesCtrl($scope, Wallet, Alerts, $uibModal, $filter, $translate, $window) {
  $scope.user = Wallet.user;
  $scope.settings = Wallet.settings;
  $scope.languages = Wallet.languages;
  $scope.currencies = Wallet.currencies;
  $scope.btcCurrencies = Wallet.btcCurrencies;
  $scope.btc = Wallet.btcCurrencies[0];

  $scope.edit = {
    email: false,
  };
  $scope.errors = {};
  $scope.mobileNumber = {
    step: 0
  };

  $scope.changeEmail = (email, success, error) => {
    Wallet.changeEmail(email, success, error);
  };

  $scope.setHandleBitcoinLinks = () => {
    Wallet.handleBitcoinLinks();
  };

  $scope.canHandleBitcoinLinks = () => {
    return $window.navigator.registerProtocolHandler != null;
  };

  $scope.$watch("settings.language", (newVal, oldVal) => {
    if ((oldVal != null) && newVal !== oldVal) {
      Wallet.changeLanguage(newVal);
    }
  });

  $scope.$watch("settings.currency", (newVal, oldVal) => {
    if ((oldVal != null) && newVal !== oldVal) {
      Wallet.changeCurrency(newVal);
    }
  });

  $scope.$watch("settings.btcCurrency", (newVal, oldVal) => {
    if ((oldVal != null) && newVal !== oldVal) {
      Wallet.changeBTCCurrency(newVal);
    }
  });

  $scope.browserCanHandleBitcoinLinks = $scope.canHandleBitcoinLinks()

  $scope.changeLogoutTime = (m, success, errorCallback) => {
    const error = () => {
      Alerts.displayError("Failed to update auto logout time");
      errorCallback();
    };
    Wallet.setLogoutTime(m, success, error);
  };

  $scope.validateFee = (candidate) => {
    let n = parseInt(candidate);
    return !isNaN(candidate) && n > 0 && n <= 1000000;
  };

  $scope.validateLogoutTime = (candidate) => {
    let n = parseInt(candidate);
    return !isNaN(candidate) && n >= 1 && n <= 1440;
  };

  $scope.changeFeePerKB = (fee, successCallback) => {
    Wallet.setFeePerKB(fee);
    successCallback();
  };

  $scope.clearErrors = () => {
    $scope.errors = {};
  };

}
