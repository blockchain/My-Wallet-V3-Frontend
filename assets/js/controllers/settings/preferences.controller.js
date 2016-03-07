angular
  .module('walletApp')
  .controller("SettingsPreferencesCtrl", SettingsPreferencesCtrl);

function SettingsPreferencesCtrl($scope, Wallet, Alerts, currency, $uibModal, $filter, $translate, $window, languages) {
  $scope.user = Wallet.user;
  $scope.settings = Wallet.settings;
  $scope.languages = languages;
  $scope.currencies = currency.currencies;
  $scope.btcCurrencies = currency.bitCurrencies;
  $scope.btc = currency.bitCurrencies[0];

  $scope.changeLanguage = Wallet.changeLanguage;
  $scope.changeCurrency = Wallet.changeCurrency;
  $scope.changeBTCCurrency = Wallet.changeBTCCurrency;

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

  $scope.enableNotifications = () => {
    Wallet.enableNotifications();
  }

  $scope.disableNotifications = () => {
    Wallet.disableNotifications();
  }

  $scope.setHandleBitcoinLinks = () => {
    Wallet.handleBitcoinLinks();
  };

  $scope.canHandleBitcoinLinks = () => {
    return $window.navigator.registerProtocolHandler != null;
  };

  $scope.browserCanHandleBitcoinLinks = $scope.canHandleBitcoinLinks()

  $scope.changeLogoutTime = (m, success, errorCallback) => {
    const error = () => {
      Alerts.displayError("Failed to update auto logout time");
      errorCallback();
    };
    Wallet.setLogoutTime(m, success, error);
  };

  $scope.validateLogoutTime = (candidate) => {
    let n = parseInt(candidate);
    return !isNaN(candidate) && n >= 1 && n <= 1440;
  };

  $scope.clearErrors = () => {
    $scope.errors = {};
  };

}
