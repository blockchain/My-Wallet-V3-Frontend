angular
  .module('walletApp')
  .controller('iSignThisCtrl', iSignThisCtrl);

function iSignThisCtrl ($scope, amount, $uibModal, $uibModalInstance, currency, Alerts, MyWallet, Wallet) {
  $scope.coinify = MyWallet.wallet.external.coinify;
  $scope.settings = Wallet.settings;

  const success = (trade) => {
    $scope.trade = trade;
  };

  const error = (err) => {
    $scope.status = {};
    Alerts.displayError(err);
  };

  $scope.coinify.buy(amount).then(success, error);

  $scope.cancel = () => $uibModalInstance.dismiss('');
  $scope.close = () => Alerts.confirm('ARE_YOU_SURE_CANCEL', {}, '', 'IM_DONE').then($scope.cancel);

  $scope.back = () => {
    $scope.cancel();

    $uibModal.open({
      templateUrl: 'partials/buy-modal.jade',
      windowClass: 'bc-modal initial',
      controller: 'BuyCtrl'
    });
  };
}
