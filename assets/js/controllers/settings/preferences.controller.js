angular
  .module('walletApp')
  .controller('SettingsPreferencesCtrl', SettingsPreferencesCtrl);

function SettingsPreferencesCtrl ($scope, Wallet, Alerts, currency, $uibModal, $filter, $translate, $window, languages, bcPhoneNumber) {
  $scope.user = Wallet.user;
  $scope.settings = Wallet.settings;
  $scope.languages = languages;
  $scope.currencies = currency.currencies;
  $scope.btcCurrencies = currency.bitCurrencies;
  $scope.btc = currency.bitCurrencies[0];

  $scope.changeLanguage = Wallet.changeLanguage;
  $scope.changeCurrency = Wallet.changeCurrency;
  $scope.changeBTCCurrency = Wallet.changeBTCCurrency;

  $scope.errors = {};
  $scope.mobileNumber = { step: 0 };

  $scope.formattedMobileNumber = null;

  $scope.$watch('status.isLoggedIn', (newValue) => {
    if (newValue && $scope.user.mobileNumber) {
      $scope.formattedMobileNumber = bcPhoneNumber.format($scope.user.mobileNumber);

      $scope.$watch('user.mobileNumber', (newValue) => {
        $scope.formattedMobileNumber = newValue;
      });
    }
  });

  $scope.enableNotifications = () => Wallet.enableNotifications();
  $scope.disableNotifications = () => Wallet.disableNotifications();
  $scope.setHandleBitcoinLinks = () => Wallet.handleBitcoinLinks();
  $scope.canHandleBitcoinLinks = () => $window.navigator.registerProtocolHandler != null;

  $scope.browserCanHandleBitcoinLinks = $scope.canHandleBitcoinLinks();

  $scope.clearErrors = () => {
    $scope.errors = {};
  };
}
