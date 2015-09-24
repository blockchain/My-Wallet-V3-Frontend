angular.module('walletApp').controller("TopCtrl", ($scope, Wallet, Currency, $stateParams) => {
  $scope.settings = Wallet.settings;
  $scope.isBitCurrency = Currency.isBitCurrency;
  $scope.toggleDisplayCurrency = Wallet.toggleDisplayCurrency;
  $scope.status = Wallet.status;
  $scope.accountIndex = $stateParams.accountIndex;

  $scope.getTotal = (index) => Wallet.total(index);
});
