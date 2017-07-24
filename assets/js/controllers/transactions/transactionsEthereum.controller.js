angular
  .module('walletApp')
  .controller('ethereumTransactionsCtrl', ethereumTransactionsCtrl);

function ethereumTransactionsCtrl ($scope, AngularHelper, $q, $translate, $uibModal, Wallet, MyWallet, format, smartAccount, Ethereum, localStorageService) {
  $scope.ethTransactions = [];
  $scope.$watch(
    () => Ethereum.defaultAccount.txs,
    (txs) => { $scope.ethTransactions = txs; }
  );

  $scope.status = Wallet.status;
  $scope.settings = Wallet.settings;
  $scope.filterBy = {
    type: undefined,
    account: undefined
  };

  $scope.ethTotal = Ethereum.defaultAccount.balance;

  $scope.loading = false;
  $scope.allTxsLoaded = false;
  $scope.canDisplayDescriptions = false;
  $scope.txLimit = 10;

  $scope.hideEtherWelcome = () => localStorageService.get('hideEtherWelcome');
  $scope.dismissWelcome = () => localStorageService.set('hideEtherWelcome', true);

  $scope.isFilterOpen = false;
  $scope.toggleFilter = () => $scope.isFilterOpen = !$scope.isFilterOpen;

  let all = { label: $translate.instant('ALL_WALLETS'), index: '', type: 'Accounts' };
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
    AngularHelper.$safeApply($scope);
  };

  $scope.exportEthPriv = () => $uibModal.open({
    templateUrl: 'partials/show-private-key-ethereum.pug',
    controllerAs: '$ctrl',
    windowClass: 'bc-modal',
    controller (Ethereum) {
      this.accessAllowed = false;
      this.address = Ethereum.defaultAccount.address;
      this.balance = Ethereum.defaultAccount.balance;
      this.requestAccess = () => Wallet.askForSecondPasswordIfNeeded().then(secPass => {
        this.accessAllowed = true;
        this.key = Ethereum.getPrivateKeyForAccount(Ethereum.defaultAccount, secPass).toString('hex');
      });
    }
  });

  let unsub = txList.subscribe(setTxs);
  $scope.$on('$destroy', unsub);

  // Searching and filtering
  if ($scope.$root.size.sm || $scope.$root.size.xs) {
    $scope.filterTypes = ['ALL_TRANSACTIONS', 'SENT', 'RECEIVED'];
  } else {
    $scope.filterTypes = ['ALL', 'SENT', 'RECEIVED'];
  }
  $scope.setFilterType = (type) => $scope.filterBy.type = $scope.filterTypes[type];
  $scope.isFilterType = (type) => $scope.filterBy.type === $scope.filterTypes[type];
  $scope.setFilterType(0);

  $scope.transactionFilter = item => {
    return ($scope.filterByType(item) && $scope.filterSearch(item, $scope.searchText));
  };

  $scope.filterSearch = (tx, search) => {
    if (!search) return true;
    return ($scope.filterTx(tx.processedInputs, search) ||
            $scope.filterTx(tx.processedOutputs, search) ||
            (tx.hash.toLowerCase().search(search.toLowerCase()) > -1) ||
            (tx.note && tx.note.toLowerCase().search(search.toLowerCase()) > -1));
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
