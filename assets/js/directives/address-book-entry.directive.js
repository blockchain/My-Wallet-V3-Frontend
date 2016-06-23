
angular
  .module('walletApp')
  .directive('addressBookEntry', addressBookEntry);

addressBookEntry.$inject = ['Wallet', '$translate', 'Alerts'];

function addressBookEntry (Wallet, $translate, Alerts) {
  const directive = {
    restrict: 'A',
    replace: true,
    scope: {
      address: '=addressBookEntry',
      searchText: '='
    },
    templateUrl: (elem, attrs) => 'templates/address-book-entry.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs, ctrl) {
    scope.delete = () => {
      Alerts.confirm('CONFIRM_DELETE_ADDRESS_BOOK_ENTRY', { address: scope.address.address })
        .then(() => Wallet.removeAddressBookEntry(scope.address));
    };
  }
}
