angular
  .module('walletApp')
  .controller('HomeCtrl', HomeCtrl);

function HomeCtrl ($scope, Wallet, $uibModal) {
  $scope.getTotal = () => Wallet.total('');

  $scope.getLegacyTotal = () => Wallet.total('imported');

  $scope.hasLegacyAddresses = () => {
    if (Wallet.status.isLoggedIn) {
      return Wallet.legacyAddresses().filter(a => !a.archived).length > 0;
    } else {
      return null;
    }
  };

  $scope.activeAccounts = () => {
    if (Wallet.status.isLoggedIn) {
      return Wallet.accounts().filter(a => !a.archived);
    } else {
      return null;
    }
  };

  if (Wallet.status.firstTime) {
    $uibModal.open({
      templateUrl: 'partials/first-login-modal.jade',
      controller: 'FirstTimeCtrl',
      resolve: {
        firstTime: () => { Wallet.status.firstTime = false; }
      },
      windowClass: 'bc-modal rocket-modal initial'
    });
  }
}
