angular
  .module('walletApp')
  .controller('iSignThisCtrl', iSignThisCtrl);

function iSignThisCtrl ($scope, amount, $uibModal, $uibModalInstance, currency, Alerts, MyWallet) {
  $scope.coinify = MyWallet.wallet.external.coinify;
  const success = (trade) => {
    $scope.trade = trade;
  };

  const error = (err) => {
    $scope.status = {};
    Alerts.displayError(err);
  };

  let n = currency.convertFromSatoshi(amount, currency.bitCurrencies[0]);
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
