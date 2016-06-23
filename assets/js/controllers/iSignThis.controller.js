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

  let n = currency.convertFromSatoshi(amount, $scope.settings.currency);
  $scope.coinify.buy(n).then(success, error);

  $scope.close = () => $uibModalInstance.dismiss('');

  $scope.back = () => {
    $scope.close();

    $uibModal.open({
      templateUrl: 'partials/buy-modal.jade',
      windowClass: 'bc-modal initial',
      controller: 'BuyCtrl'
    });
  };
}
