angular
  .module('walletApp')
  .controller('SettingsAddressesCtrl', SettingsAddressesCtrl);

function SettingsAddressesCtrl ($scope, $translate, $rootScope, $state, $stateParams, $q, $sce, Wallet, Labels, MyWalletHelpers, MyBlockchainApi, Alerts, $uibModal) {
  if (!Wallet.status.isLoggedIn) {
    console.error('Controller depends on being logged in');
    return;
  }

  let accountIndex = parseInt($stateParams.account, 10);

  $scope.presentFilter = (address) => address && address.label !== null && address.used === false;

  $scope.pastAddressesPage = (page, pageLength) => {
    let pastFilter = (address) => address && (address.label === null || address.used === true);

    return $scope.addresses.filter(pastFilter)
                           .reverse().slice((page - 1) * pageLength, page * pageLength);
  };

  $scope.addresses = Labels.all(accountIndex);

  $scope.loading = true;

  Labels.checkIfUsed(accountIndex).then(() => {
    $scope.loading = false;
    $rootScope.$safeApply();
  });

  $scope.account = Wallet.accounts()[$stateParams.account];

  $scope.receiveIndex = $scope.account.receiveIndex;

  $scope.page = 1;
  $scope.pageLength = 20;
  let totalLabeled = $scope.addresses.filter($scope.presentFilter).length;
  $scope.totalPast = $scope.addresses.length - totalLabeled;

  $scope.createAddress = () => {
    $scope.createAddressInProgress = true;

    Labels.addLabel(accountIndex, 15, $translate.instant('DEFAULT_NEW_ADDRESS_LABEL'))
      .catch(Alerts.displayError)
      .then(() => {
        $scope.createAddressInProgress = false;
        $rootScope.$safeApply();
      });
  };

  $scope.removeAddressLabel = (address) => {
    Alerts.confirm('CONFIRM_REMOVE_LABEL').then(() => {
      Labels.removeLabel(accountIndex, address).then().then(() => {
        $rootScope.$safeApply();
      });
    });
  };

  $scope.changeLabel = (address, label) => {
    return Labels.setLabel(accountIndex, address, label).then().then(() => {
      $rootScope.$safeApply();
    });
  };

  $scope.toggleShowPast = () => {
    if (!$scope.showPast) {
      if (!$scope.didLoadPast) {
        Alerts.confirm('CONFIRM_SHOW_PAST').then(() => {
          $scope.didLoadPast = true;
          $scope.showPast = true;
        });
      } else {
        $scope.showPast = true;
      }
    } else {
      $scope.showPast = false;
    }
  };

  $scope.setPastAddressesPage = (page) => {
    $scope.page = page;
    let addresses = $scope.pastAddressesPage(page, $scope.pageLength);
    Labels.fetchBalance(addresses).then(() => { $rootScope.$safeApply(); });
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
