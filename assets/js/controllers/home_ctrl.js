walletApp.controller("HomeCtrl", ($scope, $window, Wallet, $modal) => {
  $scope.status = Wallet.status;
  $scope.settings = Wallet.settings;
  $scope.getTotal = () => Wallet.total('accounts');
  $scope.legacyTotal = () => Wallet.getTotalBalanceForActiveLegacyAddresses();
  $scope.transactions = [];
  $scope.activeAccounts = Wallet.accounts().filter(a => { return !(a.archived); })

  $scope.$watch('status.didLoadTransactions', didLoad => {
    if (!didLoad) return;
    $scope.transactions = Wallet.transactions;
  });

  if ($scope.status.firstTime) {
    $modal.open({
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
});
