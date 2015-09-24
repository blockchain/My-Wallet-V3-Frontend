angular
  .module('walletApp')
  .controller('WalletNavigationCtrl', WalletNavigationCtrl);

function WalletNavigationCtrl($scope, Wallet, SecurityCenter, $state, $stateParams, $modal, filterFilter, $location) {
  $scope.status = Wallet.status;
  $scope.total = Wallet.total;
  $scope.settings = Wallet.settings;
  $scope.security = SecurityCenter.security;

  $scope.selectedAccountIndex = $stateParams.accountIndex;

  $scope.numberOfActiveLegacyAddresses = () => {
    return filterFilter(Wallet.legacyAddresses(), {
      archived: false
    }).length;
  };

  $scope.numberOfActiveAccounts = () => {
    return filterFilter(Wallet.accounts(), {
      archived: false
    }).length;
  };

  $scope.getMainAccountId = () => {
    if (!$scope.status.isLoggedIn) return 0;
    return ($scope.numberOfActiveAccounts() <= 1) ?
      Wallet.getDefaultAccountIndex() : 'accounts';
  };

  $scope.showImported = () => {
    return ($scope.selectedAccountIndex === 'imported' &&
            $state.current.name === 'wallet.common.transactions');
  };

  $scope.showOrHide = (path) => {
    return $location.url().indexOf(path) !== -1;
  };

  $scope.newAccount = () => {
    Wallet.clearAlerts();
    let modalInstance = $modal.open({
      templateUrl: 'partials/account-form.jade',
      controller: 'AccountFormCtrl',
      resolve: {
        account: () => void 0
      },
      windowClass: 'bc-modal small'
    });
    if (modalInstance != null) {
      modalInstance.opened.then(() => {
        Wallet.store.resetLogoutTimeout();
      });
    }
  };

  $scope.legacyTotal = () => {
    return Wallet.getTotalBalanceForActiveLegacyAddresses();
  };

  $scope.termsOfService = () => {
    let modalInstance = $modal.open({
      templateUrl: 'partials/terms-of-service.jade',
      windowClass: 'bc-modal terms-modal'
    });
  };

  $scope.privacyPolicy = () => {
    let modalInstance = $modal.open({
      templateUrl: 'partials/privacy-policy.jade',
      windowClass: 'bc-modal terms-modal'
    });
  };

  $scope.didLoad = () => {
    $scope.accounts = Wallet.accounts;
  };

  $scope.didLoad();

}
