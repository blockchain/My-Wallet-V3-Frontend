angular.module('walletApp').directive('addressBookEntry', (Wallet, $translate) => {
  return {
    restrict: "A",
    replace: true,
    scope: {
      address: '=addressBookEntry',
      searchText: '='
    },
    templateUrl: (elem, attrs) => 'templates/address-book-entry.jade',
    link: (scope, elem, attrs, ctrl) => {
      scope.delete = () => {
        $translate("CONFIRM_DELETE_ADDRESS_BOOK_ENTRY", {address: scope.address.address}).then((translation) => {
          if (confirm(translation)) {
            Wallet.removeAddressBookEntry(scope.address);
          }
        });
      };

    }
  };
});
