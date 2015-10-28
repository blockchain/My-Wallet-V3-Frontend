angular
  .module('walletApp')
  .controller("HomeCtrl", HomeCtrl);

function HomeCtrl($scope, Wallet, $uibModal) {
  $scope.getTotal = () => Wallet.total('');
  $scope.getLegacyTotal = () => Wallet.total('imported');
  $scope.activeAccounts = Wallet.accounts().filter(a => !a.archived)

  if (Wallet.status.firstTime) {
    $uibModal.open({
      templateUrl: "partials/first-login-modal.jade",
      controller: "FirstTimeCtrl",
      resolve: {
        firstTime: () => {
          Wallet.status.firstTime = false;
        }
      },
      windowClass: "bc-modal rocket-modal"
    });
  }
}
