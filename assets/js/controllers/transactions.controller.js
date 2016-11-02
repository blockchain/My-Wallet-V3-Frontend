angular
  .module('walletApp')
  .controller('TransactionsCtrl', TransactionsCtrl);

function TransactionsCtrl ($scope, $q, $translate, $uibModal, Wallet, MyWallet, format, smartAccount) {
  $scope.addressBook = Wallet.addressBook;
  $scope.status = Wallet.status;
  $scope.settings = Wallet.settings;
  $scope.totals = Wallet.totals;
  $scope.filterBy = {
    type: undefined,
    account: undefined
  };

  $scope.getTotal = Wallet.total;

  $scope.loading = false;
  $scope.allTxsLoaded = false;
  $scope.canDisplayDescriptions = false;
  $scope.txLimit = 10;

  $scope.isFilterOpen = false;
  $scope.toggleFilter = () => $scope.isFilterOpen = !$scope.isFilterOpen;

  let all = { label: $translate.instant('ALL'), index: '', type: 'Accounts' };
  $scope.accounts = smartAccount.getOptions();
  if ($scope.accounts.length > 1) $scope.accounts.unshift(all);
  $scope.filterBy.account = $scope.accounts[0];

  let txList = MyWallet.wallet.txList;
  $scope.transactions = txList.transactions(smartAccount.getDefaultIdx());

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

  let setTxs = $scope.setTxs = () => {
    let idx = $scope.filterBy.account.index;
    let newTxs = idx === '' || !isNaN(idx)
      ? txList.transactions(idx)
      : $scope.filterByAddress($scope.filterBy.account);
    if ($scope.transactions.length > newTxs.length) $scope.allTxsLoaded = false;
    $scope.transactions = newTxs;
    $scope.$safeApply();
  };

  $scope.exportHistory = () => $uibModal.open({
    templateUrl: 'partials/export-history.jade',
    controller: 'ExportHistoryController',
    windowClass: 'bc-modal',
    resolve: {
      activeIndex: () => {
        let idx = $scope.filterBy.account.index;
        return isNaN(idx) ? 'imported' : idx.toString();
      }
    }
  });

  let unsub = txList.subscribe(setTxs);
  $scope.$on('$destroy', unsub);

  // Searching and filtering
  $scope.filterTypes = ['ALL', 'SENT', 'RECEIVED', 'TRANSFERRED'];
  $scope.setFilterType = (type) => $scope.filterBy.type = $scope.filterTypes[type];
  $scope.isFilterType = (type) => $scope.filterBy.type === $scope.filterTypes[type];
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
    switch ($scope.filterBy.type) {
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

  $scope.filterByAddress = (addr) => (
    txList.transactions('imported').filter(tx =>
      tx.processedOutputs.concat(tx.processedInputs)
        .some(p => addr.address === p.address)
    )
  );

  $scope.$watch('filterBy.account', setTxs);
}
