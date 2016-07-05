angular
  .module('walletApp')
  .controller('iSignThisCtrl', iSignThisCtrl);

function iSignThisCtrl ($scope, iSignThisProps, $uibModal, $uibModalInstance, currency, Alerts, MyWallet, Wallet) {
  $scope.settings = Wallet.settings;
  $scope.profile = MyWallet.wallet.profile;
  $scope.exchange = MyWallet.wallet.external.coinify;
  $scope.transaction = {fiat: iSignThisProps.transaction.total};
  $scope.currencySymbol = iSignThisProps.currencySymbol;
  $scope.partner = iSignThisProps.partner;
  $scope.method = iSignThisProps.method;
  $scope.trade = iSignThisProps.trade;
  $scope.step = 5;

  $scope.cancel = () => $uibModalInstance.dismiss('');
  $scope.close = () => Alerts.confirm('ARE_YOU_SURE_CANCEL', {}, '', 'IM_DONE').then($scope.cancel);

  $scope.back = () => {
    $scope.cancel();
  };
}
