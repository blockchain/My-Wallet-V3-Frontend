angular
  .module('walletApp')
  .controller('TransactionCtrl', TransactionCtrl);

function TransactionCtrl($scope, Wallet, $log, $state, $stateParams, $filter, $cookieStore, $sce) {
  $scope.addressBook = Wallet.addressBook;
  $scope.status = Wallet.status;
  $scope.settings = Wallet.settings;
  $scope.transactions = Wallet.transactions;
  $scope.accounts = Wallet.accounts;
  $scope.accountIndex = $stateParams.accountIndex;

  $scope.from = '';
  $scope.to = '';
  $scope.transaction = {};

  $scope.$watchCollection('transactions', (newVal) => {
    $scope.transaction = $filter('getByProperty')('hash', $stateParams.hash, newVal);
  });

  $scope.$watch('transaction.hash + accounts', () => {
    let tx = $scope.transaction;
    if ((tx != null) && tx.hash && $scope.accounts().length > 0) {
      if (tx.from.account != null) {
        $scope.from = $scope.accounts()[tx.from.account.index].label;
      } else {
        if ((tx.from.legacyAddresses != null) && tx.from.legacyAddresses.length > 0) {
          let address = $filter('getByProperty')('address', tx.from.legacyAddresses[0].address, Wallet.legacyAddresses());
          if ((address.label != null) && (address.label !== address.address)) {
            $scope.from = address.label;
          } else {
            $scope.from = address.address + ' (you)';
          }
        } else if (tx.from.externalAddresses != null) {
          $scope.from = Wallet.getAddressBookLabel(tx.from.externalAddresses.addressWithLargestOutput);
          if (!$scope.from) {
            $scope.from = tx.from.externalAddresses.addressWithLargestOutput;
          }
        }
      }

      $scope.destinations = [];

      const convert = (y) => (' [' + $filter('btc')(y) + ']');

      const label = (a) => {
        let address = $filter('getByProperty')('address', a, Wallet.legacyAddresses());
        if ((address.label != null) && address.label !== address.address) {
          return address.label;
        } else {
          return address.address;
        }
      };
      const adBook = (a) => {
        let name = Wallet.getAddressBookLabel(a);
        return name ? name : a;
      };
      const makeAccountRow = (a) => ({
        'address': $scope.accounts()[a.index].label,
        'amount': convert(a.amount),
        'you': '(you) '
      });
      const makeLegacyRow = (a) => ({
        'address': label(a.address),
        'amount': convert(a.amount),
        'you': '(you) '
      });
      const makeExternalRow = (a) => ({
        'address': adBook(a.address),
        'amount': convert(a.amount),
        'you': ''
      });

      let a = tx.to.accounts;
      let l = tx.to.legacyAddresses || [];
      let e = tx.to.externalAddresses || [];

      $scope.destinations = a.map(makeAccountRow).concat(l.map(makeLegacyRow)).concat(e.map(makeExternalRow));

      if ($scope.destinations.length === 1) {
        $scope.destinations[0].amount = '';
      }
    }
  });

  $scope.backToTransactions = () => {
    $state.go("wallet.common.transactions", {accountIndex: $stateParams.accountIndex})
  }
}
