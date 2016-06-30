angular
  .module('walletApp')
  .controller('iSignThisCtrl', iSignThisCtrl);

function iSignThisCtrl ($scope, quote, trade, partner, method, displayTotalAmount, currencySymbol, $uibModal, $uibModalInstance, currency, Alerts, MyWallet, Wallet) {
  $scope.settings = Wallet.settings;
  $scope.profile = MyWallet.wallet.profile;
  $scope.currencySymbol = currencySymbol;
  $scope.displayFiatAmount = displayTotalAmount;
  $scope.exchangeAccount = true;
  $scope.partner = partner;
  $scope.method = method;
  $scope.quote = quote;
  $scope.trade = trade;
  $scope.step = 5;

  $scope.cancel = () => $uibModalInstance.dismiss('');
  $scope.close = () => Alerts.confirm('ARE_YOU_SURE_CANCEL', {}, '', 'IM_DONE').then($scope.cancel);

  $scope.back = () => {
    $scope.cancel();
  };
}
