walletApp.controller("TopCtrl", ($scope, Wallet, $stateParams) => {
  $scope.settings = Wallet.settings;
  $scope.isBitCurrency = Wallet.isBitCurrency;
  $scope.toggleDisplayCurrency = Wallet.toggleDisplayCurrency;
  $scope.status = Wallet.status;
  $scope.accountIndex = $stateParams.accountIndex;

  $scope.getTotal = (index) => Wallet.total(index);
});
