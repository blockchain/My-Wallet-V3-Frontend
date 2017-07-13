angular
  .module('walletApp')
  .controller('ethereumTransactionsCtrl', ethereumTransactionsCtrl);

function ethereumTransactionsCtrl ($scope, AngularHelper, $q, $translate, $uibModal, Wallet, MyWallet, format, smartAccount, Ethereum, localStorageService) {
  $scope.ethTransactions = [];
  /*$scope.ethTransactions = [
    {
      nonce: '',
      from: '0x16c6f6043dc49377e49388a03ed50044cd3282af',
      to: '0xc6435a9a7a851dc5dc247c6da8df38ef18349518',
      value: '65568525000000000',
      gasLimit: 21000,
      gasPrice: 35082752902,
      gasUsed: 21000,
      fee: 0.0004851,
      txType: 'sent',
      time: 1498661191,
      confirmations: 100,
      amount: 0.018353338472268105,
      hash: '0x2b6f33078ad0b6cfddbac51956596b4f3b70d155fac555a54049934989790fcb'
    },
    {
      nonce: '',
      from: '0x11c6f6043dc49377e49388a03ed50044cd3282af',
      to: '0xc6235a9a7a851dc5dc247c6da8df38ef18349518',
      value: '94168525000000000',
      gasLimit: 21000,
      gasPrice: 25082752902,
      gasUsed: 21000,
      txType: 'received',
      time: 1498661791,
      confirmations: 1,
      amount: 0.075353338472268105,
      hash: '0x1b6f33078ad0b6cfddbac51956596b4f3b70d155fac555a54049934989790fcb'
    },
    {
      nonce: '',
      from: '0x14c6f6043dc49377e49355a03ed50044cd3282af',
      to: '0xe29835a9z8z851dc5dc247c6da8df38ef18349518',
      value: '98278525000000000',
      gasLimit: 21000,
      gasPrice: 40082752902,
      gasUsed: 21000,
      txType: 'received',
      time: 1499447561,
      confirmations: 15,
      amount: 0.59893338472268105,
      hash: '0x2c4f33078ad0b6cfddbac51956596b4f3b70d155fac555a54049934989790fcb'
    },
    {
      nonce: '',
      from: '0x14c6f6043dc41255e49355a03ed50044cd3282af',
      to: '0xe87611a9z8z851dc5dc247c6da8df38ef18349518',
      value: '98278525000000000',
      gasLimit: 21000,
      gasPrice: 40082752902,
      gasUsed: 21000,
      txType: 'sent',
      time: 1499447432,
      confirmations: 13,
      amount: 0.71893338472268105,
      hash: '0x2c4f12118ad0b6cfddbac51956596b4f3b70d155fac555a54049934989790fcb'
    }
  ];*/

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

  $scope.hideEtherWelcome = () => localStorageService.get('hideEtherWelcome') ? true : false;
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
      this.key = '0x' + Ethereum.defaultAccount.privateKey.toString('hex');
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
