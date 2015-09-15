walletApp.controller("HomeCtrl", ($scope, $window, Wallet, $modal) => {
  $scope.accounts = Wallet.accounts;
  $scope.status = Wallet.status;
  $scope.settings = Wallet.settings;
  $scope.getTotal = () => Wallet.total('accounts');
  $scope.empty = false;
  $scope.transactions = [];

  $scope.accountFilter = account => {
    return account.balance > 0 && !account.archived;
  };

  $scope.$watch('status.didLoadTransactions', didLoad => {
    if (!didLoad) return;
    $scope.transactions = Wallet.transactions;
  });


  $scope.$watchCollection('accounts()', accounts => {
    if (accounts.length === 0 || !$scope.status.didLoadBalances) return;
    console.log('hello')
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
