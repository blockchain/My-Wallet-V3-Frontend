walletApp.controller("HomeCtrl", ($scope, $window, Wallet, $modal) => {
  const ACCOUNTS_IN_CHART = 4;
  $scope.accounts = Wallet.accounts;
  $scope.status = Wallet.status;
  $scope.settings = Wallet.settings;
  $scope.getTotal = () => Wallet.total('accounts');
  $scope.empty = false;
  $scope.transactions = [];
  $scope.pieChartData = {
    data: []
  };

  $scope.pieChartConfig = {
    colors: ['RGB(96, 178, 224)', 'RGB(223, 39, 22)', 'RGB(74, 198, 171)', 'RGB(244, 189, 57)', 'RGB(131, 40, 229)', 'RGB(255, 127, 0)', 'RGB(199, 202, 208)'],
    innerRadius: 40,
    labels: false,
    legend: {
      display: true,
      position: 'right',
      htmlEnabled: true
    },
    waitForHeightAndWidth: true
  };

  $scope.convertToDisplay = amount => {
    let currency = $scope.settings.displayCurrency;
    amount = Wallet.convertFromSatoshi(amount, currency);
    return Wallet.formatCurrencyForView(amount, currency);
  };

  $scope.accountFilter = account => {
    return account.balance > 0 && !account.archived;
  };

  $scope.accountSort = (account0, account1) => {
    return account1.balance - account0.balance;
  };

  $scope.chartDataFormat = account => ({
      x: account.label,
      y: [account.balance],
      tooltip: $scope.convertToDisplay(account.balance)
  });

  $scope.sumReduceAccounts = (prev, current) => ({
      balance: prev.balance + current.balance,
      label: 'Remaining Accounts'
  });

  $scope.accountData = numAccounts => {
    const accounts = $scope.accounts().filter($scope.accountFilter).sort($scope.accountSort);
    const largestAccounts = accounts.slice(0, numAccounts);
    const otherAccounts = accounts.slice(numAccounts).reduce($scope.sumReduceAccounts, {
      balance: 0
    });

    if (otherAccounts.balance !== 0) {
      largestAccounts.push(otherAccounts);
    }
    return largestAccounts.map($scope.chartDataFormat);
  };

  $scope.updatePieChartData = () => {
    $scope.pieChartData.data = $scope.accountData(ACCOUNTS_IN_CHART);
  };

  $scope.$watch('status.didLoadTransactions', didLoad => {
    if (!didLoad) return;
    $scope.transactions = Wallet.transactions;
  });

  const loadedBalances = $scope.$watch('status.didLoadBalances', didLoad => {
    if (!didLoad) return;
    $scope.updatePieChartData();
    loadedBalances(); // Remove watcher after first time
  });

  $scope.$watch('settings.displayCurrency', $scope.updatePieChartData);

  $scope.$watchCollection('accounts()', accounts => {
    if (accounts.length === 0 || !$scope.status.didLoadBalances) return;
    $scope.updatePieChartData();
  });

  $scope.newAccount = () => {
    $modal.open({
      templateUrl: "partials/account-form.jade",
      controller: "AccountFormCtrl",
      resolve: {
        account: () => (null)
      },
      windowClass: "bc-modal small"
    });
  };

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
