angular
  .module('walletApp')
  .controller('BuySellCtrl', BuySellCtrl);

function BuySellCtrl ($rootScope, $scope, $state, $uibModal, MyWallet) {
  $scope.status.waiting = true;
  $scope.profile = MyWallet.wallet.profile;
  $scope.status = {};

  $scope.buy = () => {
    $uibModal.open({
      templateUrl: 'partials/buy-modal.jade',
      windowClass: 'bc-modal initial',
      controller: 'BuyCtrl'
    });
  };
}
