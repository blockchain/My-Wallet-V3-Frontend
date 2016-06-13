angular
  .module('walletApp')
  .controller('SettingsAddressesCtrl', SettingsAddressesCtrl);

function SettingsAddressesCtrl ($scope, $stateParams, $q, $sce, Wallet, MyWalletHelpers, MyBlockchainApi, Alerts, paymentRequests) {
  $scope.paymentRequests = paymentRequests;
  $scope.account = Wallet.accounts()[$stateParams.account];
  $scope.receiveIndex = $scope.account.receiveIndex;

  $scope.page = 1;
  $scope.pageLength = 20;
  $scope.totalItems = $scope.receiveIndex - $scope.paymentRequests.length + 1;
  $scope.hdLabels = $scope.account.receivingAddressesLabels.reduce((acc, address) => { acc[address.index] = address.label; return acc; }, {});

  $scope.createAddress = () => {
    Wallet.addAddressForAccount($scope.account)
      .then(address => $scope.paymentRequests.push(address))
      .catch(Alerts.displayError);
  };

  $scope.removeAddressLabel = (addressIndex, i, used) => {
    Alerts.confirm('CONFIRM_REMOVE_LABEL').then(() => {
      $scope.account.removeLabelForReceivingAddress(addressIndex);
      used
        ? $scope.usedAddresses[i].label = null
        : $scope.paymentRequests.splice(i, 1);
    });
  };

  $scope.toggleShowPast = () => $scope.showPast
    ? $scope.showPast = false
    : Alerts.confirm('SHOW_PAST').then(() => $scope.showPast = true);

  $scope.setAddresses = (page) => {
    $scope.usedAddresses = $scope.generatePage(page);
  };

  $scope.generatePage = MyWalletHelpers.memoize((page) => {
    let addresses = $scope.getIndexesForPage(page).map(index => ({
      index,
      address: Wallet.getReceiveAddress($scope.account.index, index),
      label: $scope.hdLabels[index]
    }));
    if (addresses.length === 0) return;
    $q.resolve(
      MyBlockchainApi.getBalances(addresses.map(a => a.address))
    ).then((data) => {
      addresses.forEach((a) => {
        if (!data[a.address]) return;
        a.balance = data[a.address].final_balance;
        a.ntxs = data[a.address].n_tx;
      });
    });
    return addresses;
  });

  $scope.getIndexesForPage = (page) => {
    let indexes = [];
    let used = [];
    for (let i = 0; i < $scope.paymentRequests.length; i++) {
      used[$scope.paymentRequests[i].index] = true;
    }
    for (
      let i = $scope.account.receiveIndex, n = i;
      i >= 0 && n >= 0 && indexes.length < $scope.pageLength;
      i--
    ) {
      if (used[i]) continue;
      let start = $scope.receiveIndex - (page - 1) * $scope.pageLength;
      if (n <= start && n > start - $scope.pageLength) indexes.push(i);
      n--;
    }
    return indexes;
  };
}
