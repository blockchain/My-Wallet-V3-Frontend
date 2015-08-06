walletApp.controller "HomeCtrl", ($scope, $window, Wallet, $modal) ->
  $scope.accounts = Wallet.accounts
  $scope.status = Wallet.status
  $scope.settings = Wallet.settings
  $scope.getTotal = () -> Wallet.total('accounts')
  $scope.empty = false
  $scope.transactions = []

  $scope.pieChartData = { data: [] }

  $scope.pieChartConfig = {
    colors: [ 'RGB(96, 178, 224)','RGB(238, 107, 93)', 'RGB(74, 198, 171)', 'RGB(244, 189, 57)',
    'RGB(66, 165, 219)', 'RGB(38, 188, 157)', 'RGB(244, 199, 88)', 'RGB(234, 81, 62)'
    ]
    innerRadius: 60
    labels: false
    legend: {
      display: true,
      position: 'right'
      htmlEnabled: true
    }
    waitForHeightAndWidth: true
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
