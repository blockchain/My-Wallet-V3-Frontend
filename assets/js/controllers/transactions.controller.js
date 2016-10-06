angular
  .module('walletApp')
  .controller('TransactionsCtrl', TransactionsCtrl);

function TransactionsCtrl ($scope, Wallet, MyWallet, $q, $stateParams, $state, $rootScope, $uibModal, format) {
  $scope.addressBook = Wallet.addressBook;
  $scope.status = Wallet.status;
  $scope.settings = Wallet.settings;
  $scope.totals = Wallet.totals;
  $scope.filterByAccount = {};

  $scope.getTotal = Wallet.total;

  $scope.loading = false;
  $scope.allTxsLoaded = false;
  $scope.canDisplayDescriptions = false;
  $scope.txLimit = 10;

  // more logic here later
  let idx = Wallet.my.wallet.hdwallet.defaultAccountIndex;

  let accounts = Wallet.accounts().filter(a => !a.archived && a.index != null);
  let addresses = Wallet.legacyAddresses().filter(a => !a.archived);

  $scope.accounts = accounts.concat(addresses).map(format.origin);
  $scope.filterByAccount.account = $scope.accounts.filter(a => a.index === idx)[0];

  let txList = MyWallet.wallet.txList;
  $scope.transactions = txList.transactions(idx);

  let fetchTxs = () => {
    $scope.loading = true;
    $q.resolve(MyWallet.wallet.fetchTransactions())
      .then((numFetched) => $scope.allTxsLoaded = numFetched < txList.loadNumber)
      .finally(() => $scope.loading = false);
  };

  if ($scope.transactions.length === 0) fetchTxs();

  $scope.nextPage = () => {
    if ($scope.txLimit < $scope.transactions.length) $scope.txLimit += 5;
    else if (!$scope.allTxsLoaded && !$scope.loading) fetchTxs();
  };

  $scope.$watchCollection('accounts', newValue => {
    $scope.canDisplayDescriptions = $scope.accounts.length > 0;
  });

  let setTxs = () => {
    let newTxs;
    let idx = $scope.filterByAccount.account.index;
    !isNaN(idx) && (newTxs = txList.transactions(idx));
    isNaN(idx) && (newTxs = $scope.filterByAddress($scope.filterByAccount.account));
    if ($scope.transactions.length > newTxs.length) $scope.allTxsLoaded = false;
    $scope.transactions = newTxs;
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

  $scope.filterByAddress = (addr) => {
    let txs = [];
    txList.transactions().forEach((tx) => {
      tx.processedOutputs.concat(tx.processedInputs).filter((p) => {
        if (addr.address === p.address) txs.push(tx);
      });
    });

    return txs;
  };

  $scope.$watch('filterByAccount.account', setTxs);
}
