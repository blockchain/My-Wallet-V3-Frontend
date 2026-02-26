angular
  .module('walletApp')
  .controller('bitcoinCashTransactionsCtrl', bitcoinCashTransactionsCtrl);

function bitcoinCashTransactionsCtrl ($scope, $translate, $state, $q, $uibModal, localStorageService, ShapeShift, AngularHelper, smartAccount, MyWallet, Wallet, BitcoinCash, Ethereum, modals) {
  $scope.addressBook = Wallet.addressBook;
  $scope.status = Wallet.status;
  $scope.settings = Wallet.settings;
  $scope.totals = Wallet.totals;
  $scope.filterBy = {
    type: undefined,
    account: undefined
  };

  $scope.getTotal = () => BitcoinCash.balance;

  $scope.loading = false;
  $scope.allTxsLoaded = false;
  $scope.canDisplayDescriptions = false;
  $scope.txLimit = 10;

  $scope.isFilterOpen = false;
  $scope.toggleFilter = () => $scope.isFilterOpen = !$scope.isFilterOpen;

  let all = { label: $translate.instant('BITCOIN_CASH.ALL_WALLETS'), index: '', type: 'Accounts' };
  $scope.activeWallets = BitcoinCash.accounts.filter(a => !a.archived);
  $scope.imported = MyWallet.wallet.bch.importedAddresses;
  $scope.accounts = $scope.imported ? $scope.activeWallets.concat([$scope.imported]) : $scope.activeWallets;
  if ($scope.accounts.length > 1) $scope.accounts.unshift(all);
  $scope.filterBy.account = $scope.accounts[0];
  let txList = MyWallet.wallet.bch.txs;
  txList.loadNumber = txList.length;

  let setTxs = $scope.setTxs = () => {
    $scope.transactions = MyWallet.wallet.bch.txs.filter((tx) => {
      if ($scope.filterBy.account.index === '') return true;
      else return tx.belongsTo($scope.filterBy.account.index >= 0 ? $scope.filterBy.account.index : 'imported');
    });
    AngularHelper.$safeApply($scope);
  };

  let fetchTxs = () => {
    $scope.loading = true;
    $q.resolve(MyWallet.wallet.fetchTransactions())
      .then((numFetched) => $scope.allTxsLoaded = numFetched < txList.loadNumber)
      .finally(() => $scope.loading = false);
  };

  $scope.setTxs();
  if ($scope.transactions.length === 0) fetchTxs();

  $scope.nextPage = () => {
    if ($scope.txLimit < $scope.transactions.length) $scope.txLimit += 5;
    else if (!$scope.allTxsLoaded && !$scope.loading) fetchTxs();
  };

  $scope.$watchCollection('accounts', newValue => {
    $scope.canDisplayDescriptions = $scope.accounts.length > 0;
  });

  $scope.exportHistory = () => $uibModal.open({
    templateUrl: 'partials/export-history.pug',
    controller: 'ExportHistoryController',
    controllerAs: 'vm',
    windowClass: 'bc-modal',
    resolve: {
      activeIndex: () => {
        let idx = $scope.filterBy.account.index;
        return isNaN(idx) ? 'imported' : idx.toString();
      },
      accts: () => ({
        accounts: $scope.activeWallets,
        addresses: $scope.imported && $scope.imported.addresses
      }),
      coinCode: () => 'bch'
    }
  });

  // Searching and filtering
  if ($scope.$root.size.sm || $scope.$root.size.xs) {
    $scope.filterTypes = ['ALL_TRANSACTIONS', 'SENT', 'RECEIVED', 'TRANSFERRED'];
  } else {
    $scope.filterTypes = ['ALL', 'SENT', 'RECEIVED', 'TRANSFERRED'];
  }
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

  $scope.hideWelcome = () => localStorageService.get('hideBitcoinCashWelcome');
  $scope.dismissWelcome = () => localStorageService.set('hideBitcoinCashWelcome', true);

  $scope.onClickCta = () => {
    if (ShapeShift.userHasAccess && (Wallet.total('') > 0 + Wallet.total('imported') || Ethereum.balance > 0)) {
      $state.go('wallet.common.shift', { destination: 'bch' });
    } else {
      modals.openRequest(null, { code: 'bch' });
    }
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

  $scope.$watch('filterBy.account', setTxs);
  $scope.$watch(() => BitcoinCash.txs, (txs) => setTxs(), true);

  if (!BitcoinCash.hasSeenAddressChangeNotice && txList.length) modals.openAnnouncement('BCH_ADDRESS_CHANGE', null, BitcoinCash.setHasSeenAddressChangeNotice(true));
}
