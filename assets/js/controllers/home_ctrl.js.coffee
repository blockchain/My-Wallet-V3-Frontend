walletApp.controller "HomeCtrl", ($scope, $window, Wallet, $modal) ->
  $scope.accounts = Wallet.accounts
  $scope.status = Wallet.status
  $scope.settings = Wallet.settings
  $scope.getTotal = () -> Wallet.total('accounts')
  $scope.transactions = []

  $scope.pieChartData = { data: [] }

  $scope.pieChartConfig = {
    colors: ['RGB(102, 209, 233)', 'RGB(107, 158, 232)', 'RGB(212, 238, 249)', 
      'RGB(88, 185, 87)', 'RGB(242, 174, 67)', 'RGB(78, 195, 158)', 'RGB(224, 39, 113)',
      'RGB(102, 209, 233)', 'RGB(248, 142, 85)', 'RGB(133, 180, 90)'
    ]
    legend: {
      display: true,
      position: 'right'
    }
  }

  $scope.convertToDisplay = (amount) ->
    currency = $scope.settings.displayCurrency
    amount = Wallet.convertFromSatoshi(amount, currency)
    Wallet.formatCurrencyForView(amount, currency)

  $scope.accountFilter = (account) ->
    account.balance > 0 && !account.archived

  $scope.accountData = () ->
    $scope.accounts().filter($scope.accountFilter)
      .map (a) ->
        x: a.label
        y: [a.balance]
        tooltip: $scope.convertToDisplay(a.balance)

  $scope.updatePieChartData = () ->
    $scope.pieChartData.data = $scope.accountData()

  # Watchers
  loadedTxs = $scope.$watch 'status.didLoadTransactions', (didLoad) ->
    return unless didLoad
    $scope.transactions = Wallet.transactions
    loadedTxs()

  loadedBalances = $scope.$watch 'status.didLoadBalances', (didLoad) ->
    return unless didLoad
    $scope.updatePieChartData()
    loadedBalances()

  $scope.$watch 'settings.displayCurrency', ->
    $scope.updatePieChartData()

  $scope.$watchCollection 'accounts()', (accounts) ->
    return unless accounts.length > 0 && $scope.status.didLoadBalances
    $scope.updatePieChartData()

  # Modals
  $scope.newAccount = () ->
    modalInstance = $modal.open(
      templateUrl: "partials/account-form.jade"
      controller: "AccountFormCtrl"
      resolve:
        account: -> undefined
      windowClass: "bc-modal"
    )

  if $scope.status.firstTime
    modalInstance = $modal.open(
      templateUrl: "partials/first-login-modal.jade"
      controller: "FirstTimeCtrl"
      resolve:
        firstTime: ->
          Wallet.status.firstTime = false
      windowClass: "bc-modal rocket-modal"
    )
