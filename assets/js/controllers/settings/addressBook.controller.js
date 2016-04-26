angular
  .module('walletApp')
  .controller('SettingsAddressBookCtrl', SettingsAddressBookCtrl);

function SettingsAddressBookCtrl ($scope, Wallet) {
  $scope.addressBook = Wallet.addressBook;
}
