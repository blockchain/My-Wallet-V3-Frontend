
angular
  .module('walletApp')
  .directive('addressBookEntry', addressBookEntry);

addressBookEntry.$inject = ['Wallet', '$translate'];

function addressBookEntry(Wallet, $translate) {
  const directive = {
    restrict: "A",
    replace: true,
    scope: {
      address: '=addressBookEntry',
      searchText: '='
    },
    templateUrl: (elem, attrs) => 'templates/address-book-entry.jade',
    link: link
  };
  return directive;

  function link(scope, elem, attrs, ctrl) {
    scope.delete = () => {
      $translate("CONFIRM_DELETE_ADDRESS_BOOK_ENTRY", {address: scope.address.address}).then((translation) => {
        if (confirm(translation)) {
          Wallet.removeAddressBookEntry(scope.address);
        }
      });
    };
  }
}
