angular
  .module('walletApp')
  .controller('TransactionsCtrl', TransactionsCtrl);

function TransactionsCtrl ($scope, Wallet, MyWallet, $timeout, $stateParams, $state, $rootScope, $uibModal) {
  $scope.addressBook = Wallet.addressBook;
  $scope.status = Wallet.status;
  $scope.settings = Wallet.settings;
  $scope.totals = Wallet.totals;
  $scope.accounts = Wallet.accounts;

  $scope.getTotal = Wallet.total;

  $scope.loading = false;
  $scope.allTxsLoaded = false;
  $scope.canDisplayDescriptions = false;
  $scope.txLimit = 10;

  let txList = MyWallet.wallet.txList;
  $scope.account = $stateParams.accountIndex;
  $scope.transactions = txList.transactions($scope.account);
  $scope.transactions.forEach(function initAbs (tx) {
    tx.absamt = Math.abs(tx.amount);
  });

  let fetchTxs = () => {
    $scope.loading = true;
    MyWallet.wallet.fetchTransactions().then((numFetched) => {
      $timeout(() => {
        $scope.allTxsLoaded = numFetched < txList.loadNumber;
        $scope.loading = false;
      });
    }).catch(() => {
      $timeout(() => $scope.loading = false);
    });
  };

  if ($scope.transactions.length === 0) fetchTxs();

  $scope.nextPage = () => {
    if ($scope.txLimit < $scope.transactions.length) $scope.txLimit += 5;
    else if (!$scope.allTxsLoaded && !$scope.loading) fetchTxs();
  };

  $scope.$watchCollection('accounts()', newValue => {
    $scope.canDisplayDescriptions = $scope.accounts().length > 0;
  });

  let setTxs = () => {
    let newTxs = txList.transactions($scope.account);
    if ($scope.transactions.length > newTxs.length) $scope.allTxsLoaded = false;
    $scope.transactions = newTxs;
    $scope.transactions.forEach(function initAbs (tx) {
      tx.absamt = Math.abs(tx.amount);
    });
    for (var tx in $scope.transactions) { tx.absamt = Math.abs(tx.amount); }
    $rootScope.$safeApply();
  };

  $scope.exportHistory = () => $uibModal.open({
    templateUrl: 'partials/export-history.jade',
    controller: 'ExportHistoryController',
    windowClass: 'bc-modal',
    resolve: { activeIndex: () => $scope.account }
  });

  let unsub = txList.subscribe(setTxs);
  $scope.$on('$destroy', unsub);

  // Searching and filtering
  $scope.filterTypes = ['ALL', 'SENT', 'RECEIVED', 'TRANSFERRED'];
  $scope.setFilterType = (type) => $scope.filterBy = $scope.filterTypes[type];
  $scope.isFilterType = (type) => $scope.filterBy === $scope.filterTypes[type];
  $scope.setFilterType(0);

  $scope.transactionFilter = item => {
    return ($scope.filterByType(item) &&
            $scope.filterSearch(item, $scope.searchText));
  };

  $scope.filterSearch = (tx, search) => {
    if (!search) return true;
    return ($scope.filterTx(tx.processedInputs, search) ||
            $scope.filterTx(tx.processedOutputs, search) ||
            (tx.hash.toLowerCase().search(search.toLowerCase()) > -1) ||
            (tx.note && tx.note.toLowerCase().search(search.toLowerCase()) > -1));
  };

  $scope.checkLabelDiff = (label, address) => {
    return label === address ? address : label + ', ' + address;
  };

  // Sorting
  $scope.sortTypes = ['TIME', 'AMOUNT'];
  $scope.sortTerms = ['-time', '-absamt'];
  $scope.isSortType = (type) => $scope.order;
  
  $scope.orderBy = (order) => {
    $scope.order = (order === 'TIME' ? $scope.sortTerms[0] : (order === 'AMOUNT' ? $scope.sortTerms[1] : $scope.sortTerms[0]));
  };
  $scope.orderBy();

  $scope.filterTx = (coins, search) => {
    return coins
      .map(coin => $scope.checkLabelDiff(coin.label, coin.address))
      .join(', ').toLowerCase().search(search.toLowerCase()) > -1;
  };

  $scope.filterByType = tx => {
    switch ($scope.filterBy) {
      case $scope.filterTypes[0]:
        return true;
      case $scope.filterTypes[1]:
        return tx.txType === 'sent';
      case $scope.filterTypes[2]:
        return tx.txType === 'received';
      case $scope.filterTypes[3]:
        return tx.txType === 'transfer';
    }
    return false;
  };
}
