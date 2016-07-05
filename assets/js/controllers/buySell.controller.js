angular
  .module('walletApp')
  .controller('BuySellCtrl', BuySellCtrl);

function BuySellCtrl ($rootScope, $scope, $state, $uibModal, MyWallet, Wallet) {
  $scope.user = Wallet.user;
  $scope.status = {waiting: true};
  $scope.exchange = MyWallet.wallet.external.coinify;

  $scope.fetchProfile = () => {
    $scope.status.waiting = true;
    if (!$scope.user.isEmailVerified) { $scope.status = {}; return; }

    const success = () => $scope.status = {};

    const error = () => $scope.status = {};

    return $scope.exchange.fetchProfile().then(success, error);
  };

  $scope.buy = () => {
    $uibModal.open({
      templateUrl: 'partials/buy-modal.jade',
      windowClass: 'bc-modal initial',
      controller: 'BuyCtrl',
      backdrop: 'static',
      resolve: { exchange: $scope.exchange }
    });
  };

  if ($scope.exchange) $scope.fetchProfile();
  else $scope.status = {};
}
