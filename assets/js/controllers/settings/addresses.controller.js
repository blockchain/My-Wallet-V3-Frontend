angular
  .module('walletApp')
  .controller('SettingsAddressesCtrl', SettingsAddressesCtrl);

function SettingsAddressesCtrl ($scope, $stateParams, $q, $sce, Wallet, MyWalletHelpers, MyBlockchainApi, Alerts, paymentRequests) {
  $scope.paymentRequests = paymentRequests;
  $scope.account = Wallet.accounts()[$stateParams.account];
  $scope.receiveIndex = $scope.account.receiveIndex;

  $scope.page = 1;
  $scope.pageLength = 20;
  $scope.hdLabels = $scope.account.receivingAddressesLabels.reduce((acc, address) => { acc[address.index] = address.label; return acc; }, {});

  $scope.addressLink = (address) => $sce.trustAsResourceUrl(`${$scope.rootURL}address/${address}`);

  $scope.createAddress = () => {
    Wallet.addAddressForAccount($scope.account)
      .then(address => $scope.paymentRequests.push(address))
      .catch(Alerts.displayError);
  };

  $scope.removeAddressLabel = (addressIndex, i) => {
    Alerts.confirm('CONFIRM_REMOVE_LABEL').then(() => {
      $scope.account.removeLabelForReceivingAddress(addressIndex);
      $scope.paymentRequests.splice(i, 1);
    });
  };

  $scope.toggleShowPast = () => $scope.showPast
    ? $scope.showPast = false
    : Alerts.confirm('SHOW_PAST').then(() => $scope.showPast = true);

  $scope.setAddresses = (page) => {
    $scope.addresses = $scope.generatePage(page);
  };

  $scope.generatePage = MyWalletHelpers.memoize((page) => {
    let addresses = [];
    let blacklist = {};
    for (let i = 0; i < $scope.paymentRequests.length; i++) {
      blacklist[$scope.paymentRequests[i].index] = true;
    }
    for (let i = 0; addresses.length < $scope.pageLength; i++) {
      let index = $scope.receiveIndex - ((page - 1) * $scope.pageLength) - i;
      let label = $scope.hdLabels[index];
      if (blacklist[index]) continue;
      if (index < 0 || i > 60) break;
      let address = Wallet.getReceiveAddress($scope.account.index, index);
      addresses.push({ index, address, label });
    }
    if (addresses.length === 0) return;
    $q.resolve(
      MyBlockchainApi.getBalances(addresses.map(a => a.address))
    ).then((data) => {
      addresses.forEach((a) => {
        if (!data[a.address]) return;
        a.balance = data[a.address].final_balance;
        a.total = data[a.address].total_received;
        a.ntxs = data[a.address].n_tx;
      });
    });
    return addresses;
  });
}
