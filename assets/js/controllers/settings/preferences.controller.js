angular
  .module('walletApp')
  .controller('SettingsPreferencesCtrl', SettingsPreferencesCtrl);

function SettingsPreferencesCtrl ($scope, Wallet, Alerts, currency, $uibModal, $filter, $translate, $window, languages, bcPhoneNumber, theme) {
  $scope.user = Wallet.user;
  $scope.settings = Wallet.settings;
  $scope.notifications = $scope.settings.notifications;
  $scope.languages = languages.languages;
  $scope.themes = theme.themes;
  $scope.currencies = currency.currencies;
  $scope.btcCurrencies = currency.bitCurrencies;
  $scope.ethCurrencies = currency.ethCurrencies;
  $scope.btc = currency.bitCurrencies[0];

  $scope.changeLanguage = Wallet.changeLanguage;
  $scope.changeCurrency = Wallet.changeCurrency;
  $scope.changeBTCCurrency = Wallet.changeBTCCurrency;
  $scope.changeTheme = Wallet.changeTheme;
  $window.innerWidth < 992 ? $scope.responsivePlacement = 'right' : $scope.responsivePlacement = 'left';

  $scope.changeETHCurrency = (val) => {
    console.log('change eth currency', val);
  };

  $scope.updateNotificationsType = () => {
    Wallet.updateNotificationsType($scope.notifications).then(() => {
      if ($scope.settings.notifications_on !== 2) {
        Wallet.updateNotificationsOn({ receive: true });
      }
    });
  };

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

  $scope.setHandleBitcoinLinks = () => Wallet.handleBitcoinLinks();
  $scope.canHandleBitcoinLinks = () => $window.navigator.registerProtocolHandler != null;

  $scope.browserCanHandleBitcoinLinks = $scope.canHandleBitcoinLinks();
}
