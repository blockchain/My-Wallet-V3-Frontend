angular
  .module('walletApp')
  .controller('SettingsAddressesCtrl', SettingsAddressesCtrl);

// TODO: remove $timeout
function SettingsAddressesCtrl ($scope, $timeout, $state, $stateParams, $q, $sce, Wallet, Labels, MyWalletHelpers, MyBlockchainApi, Alerts, $uibModal) {
  if (!Wallet.status.isLoggedIn) {
    console.error('Controller depends on being logged in');
    return;
  }

  // From routes.js:
  // ,
  // resolve: {
  //   paymentRequests: ($stateParams, $q, $injector) => {
  //     try {
  //       let Wallet = $injector.get('Wallet');
  //       let index = parseInt($stateParams.account, 10);
  //       return Wallet.getPendingPayments(index).catch(() => $q.reject('LOAD_ADDR_ERR'));
  //     } catch (e) {
  //       return $q.resolve([]);
  //     }
  //   }

  // From wallet service:
  // wallet.getPendingPayments = (acctIdx) => {
  //   let labelledAddresses = wallet.getLabelledHdAddresses(acctIdx);
  //   let addresses = labelledAddresses.map(a => a.address);
  //   return $q.resolve(MyBlockchainApi.getBalances(addresses)).then(data => (
  //     labelledAddresses.map(({ index, address, label }) => ({
  //       index, address, label,
  //       ntxs: data[address].n_tx
  //     })).filter(a => a.ntxs === 0)
  //   ));
  // };

  let accountIndex = $stateParams.account;

  $scope.presentFilter = (address) => address && !!address.label && address.used === false;
  $scope.pastFilter = (address) => address && (!address.label || address.used === true);

  // TODO: make address a lazy getter
  $scope.addresses = [ // labels.all(accountIndex)
    {address: "1AbC", label: "Test", used: null},
    null,
    {address: "1GHI", label: "Test 2", used: null},
    null,
    null
  ];

  $scope.loading = true;

  $timeout(() => {
    $scope.addresses[0].used = false;
    $scope.addresses[2].used = false;
    $scope.loading = false;
  }, 2000);
  // This will be cached in the future:
  // labels.checkForPayments() // digest and $scope.loading = true after


  $scope.account = Wallet.accounts()[$stateParams.account];

  // TODO: use Labels
  $scope.receiveIndex = $scope.account.receiveIndex;

  $scope.page = 1;
  $scope.pageLength = 1;
  $scope.totalUsed = null;
  // TODO: update later
  // $scope.totalUsed = $scope.receiveIndex - $scope.paymentRequests.length + 1;

  $scope.createAddress = () => {
    // TODO: use Labels
    Wallet.addAddressForAccount($scope.account)
      .then(address => $scope.paymentRequests.push(address))
      .catch(Alerts.displayError);
  };

  $scope.removeAddressLabel = (addressIndex, i, used) => {
    Alerts.confirm('CONFIRM_REMOVE_LABEL').then(() => {
      // TODO: use Labels
      $scope.account.removeLabelForReceivingAddress(addressIndex);
      used
        ? $scope.usedAddresses[i].label = null
        : $scope.paymentRequests.splice(i, 1);
    });
  };

  $scope.toggleShowPast = () => {
    if (!$scope.showPast) {
      Alerts.confirm('CONFIRM_SHOW_PAST').then(() => {
        $scope.showPast = true;
        // TODO: labels.insertUnlabeledAddresses()
        $scope.addresses[1] =  {address: "1DeF", used: null}
        $scope.addresses[3] =  {address: "1KlM", used: null}
        $scope.totalPast = 4 - 2;
      });
    } else {
      $scope.showPast = false;
    }
  };

  $scope.setPastAddressesPage = (page) => {
    console.log("Page", page)
    $scope.page = page;
  };

  $scope.newAccount = () => {
    Alerts.clear();
    $uibModal.open({
      templateUrl: 'partials/account-form.pug',
      windowClass: 'bc-modal initial',
      controller: 'AccountFormCtrl',
      resolve: {
        account: () => void 0
      }
    });
  };

  $scope.editAccount = (account) => {
    Alerts.clear();
    $uibModal.open({
      templateUrl: 'partials/account-form.pug',
      controller: 'AccountFormCtrl',
      windowClass: 'bc-modal sm',
      resolve: {
        account: () => account
      }
    });
  };

  $scope.revealXpub = (account) => {
    $uibModal.open({
      templateUrl: 'partials/reveal-xpub.pug',
      controller: 'RevealXpubCtrl',
      resolve: {
        account: () => account
      },
      windowClass: 'bc-modal'
    });
  };

  $scope.makeDefault = (account) => {
    Wallet.setDefaultAccount(account);
    Wallet.saveActivity(3);
  };

  $scope.archive = (account) => Wallet.archive(account);
  $scope.unarchive = (account) => Wallet.unarchive(account);
  $scope.isDefault = (account) => Wallet.isDefaultAccount(account);
  $scope.$watch('account.archived', (isArchived) => isArchived && $state.go('wallet.common.settings.accounts_index'));
}
