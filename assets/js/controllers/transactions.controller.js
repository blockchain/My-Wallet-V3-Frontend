angular
  .module('walletApp')
  .controller("TransactionsCtrl", TransactionsCtrl);

function TransactionsCtrl($scope, Wallet, MyWallet, $log, $stateParams, $timeout, $state) {
  $scope.filterTypes = ['ALL', 'SENT', 'RECEIVED_BITCOIN_FROM', 'MOVED_BITCOIN_TO'];
  $scope.setFilterType = type => {
    $scope.filterBy = $scope.filterTypes[type];
  };
  $scope.isFilterType = (type) => $scope.filterBy === $scope.filterTypes[type];

  $scope.nextPage = () => {
    if ($scope.allTransactionsLoaded || $scope.loading) {
      return;
    }
    $scope.loading = true;
    const success = () => {
      $scope.loading = false;
    };
    const error = () => {
      $scope.loading = false;
    };
    const allTransactionsLoaded = () => {
      $scope.allTransactionsLoaded = true;
      $scope.loading = false;
    };
    Wallet.fetchMoreTransactions($stateParams.accountIndex, success, error, allTransactionsLoaded);
  };
  $scope.showTransaction = transaction => {
    $state.go("wallet.common.transaction", {
      accountIndex: $scope.accountIndex,
      hash: transaction.hash
    });
  };

  $scope.selectedAccountIndex = $stateParams.accountIndex;

  $scope.toggleTransaction = (transaction) => {
    transaction.toggled = !transaction.toggled;
  };

  $scope.getTotal = i => $scope.total(i);

  $scope.$watch('selectedAccountIndex', newVal => {
    if (newVal !== '') {
      $scope.nextPage();
    }
  });

  $scope.$watchCollection("accounts()", newValue => {
    $scope.canDisplayDescriptions = $scope.accounts().length > 0;
  });

  $scope.didLoad = () => {
    $scope.transactions = Wallet.transactions;
    $scope.addressBook = Wallet.addressBook;
    $scope.status = Wallet.status;
    $scope.settings = Wallet.settings;
    $scope.totals = Wallet.totals;
    $scope.total = Wallet.total;
    $scope.accountIndex = $stateParams.accountIndex;
    $scope.accounts = Wallet.accounts;
    $scope.canDisplayDescriptions = false;
    $scope.allTransactionsLoaded = false;
    $scope.setFilterType(0);
  };

  $scope.transactionFilter = item => {
    return ($scope.filterByLocation(item) &&
            $scope.filterByType(item) &&
            $scope.filterSearch(item, $scope.searchText));
  };

  $scope.filterSearch = (tx, search) => {
    if (search === '' || (search == null)) return true;
    return $scope.filterTx(tx.to, search) || $scope.filterTx(tx.from, search);
  };

  $scope.filterTx = (tx, search) => {
    let text;
    if ((tx.account != null) && (tx.account.index != null)) {
      text = Wallet.accounts()[tx.account.index].label;
    } else if (tx.legacyAddresses != null) {
      text = JSON.stringify(tx.legacyAddresses.map((ad) => ad.address));
    } else if (tx.externalAddresses != null) {
      text = tx.externalAddresses.addressWithLargestOutput || JSON.stringify(tx.externalAddresses.map(ad => ad.address));
    } else {
      return false;
    }
    if ((text != null) && (text.join != null)) {
      text = text.join(',');
    }
    return text.toLowerCase().search(search.toLowerCase()) > -1;
  };

  $scope.filterByType = tx => {
    switch ($scope.filterBy) {
      case $scope.filterTypes[0]:
        return true;
      case $scope.filterTypes[1]:
        return tx.result < 0 && !tx.intraWallet;
      case $scope.filterTypes[2]:
        return tx.result > 0 && !tx.intraWallet;
      case $scope.filterTypes[3]:
        return tx.intraWallet;
    }
    return false;
  };

  $scope.filterByLocation = item => {
    if ($stateParams.accountIndex === "") {
      return true;
    }
    if ($stateParams.accountIndex === "imported") {
      return (item.to.legacyAddresses && item.to.legacyAddresses.length) || (item.from.legacyAddresses && item.from.legacyAddresses.length);
    }
    return (
      (item.to.accounts.length > 0 && item.to.accounts.some((account) => account.index === parseInt($stateParams.accountIndex)))
      || ((item.from.account != null) && item.from.account.index === parseInt($stateParams.accountIndex))
    );
  };

  $scope.$watch("status.didLoadTransactions", newValue => {
    return $scope.loading = !newValue;
  });

  $scope.didLoad();
}
