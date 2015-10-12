angular
  .module('walletApp')
  .controller("SettingsWalletCtrl", SettingsWalletCtrl);

function SettingsWalletCtrl($scope, Wallet, $translate, $window) {
  $scope.settings = Wallet.settings;
  $scope.languages = Wallet.languages;
  $scope.currencies = Wallet.currencies;
  $scope.btcCurrencies = Wallet.btcCurrencies;
  $scope.uid = Wallet.user.uid;

  $scope.setHandleBitcoinLinks = () => {
    Wallet.handleBitcoinLinks();
  };

  $scope.canHandleBitcoinLinks = () => $window.navigator.registerProtocolHandler != null;

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

}
