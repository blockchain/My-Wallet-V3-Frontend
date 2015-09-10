walletApp.controller "HomeCtrl", ($scope, $window, Wallet, $modal) ->
  $scope.accounts = Wallet.accounts
  $scope.status = Wallet.status
  $scope.settings = Wallet.settings
  $scope.getTotal = () -> Wallet.total('accounts')
  $scope.empty = false
  $scope.transactions = []

  $scope.pieChartData = { data: [] }

  $scope.pieChartConfig = {
    colors: [ 'RGB(96, 178, 224)','RGB(223, 39, 22)', 'RGB(74, 198, 171)', 'RGB(244, 189, 57)',
    'RGB(131, 40, 229)', 'RGB(255, 127, 0)', 'RGB(199, 202, 208)'
    ]
    innerRadius: 40
    labels: false
    legend: {
      display: true,
      position: 'right'
      htmlEnabled: true
    }
    waitForHeightAndWidth: true
  }

  $scope.lineChartData = { series: [''], data: [] }

  $scope.lineChartConfig = {
    colors: [ 'RGB(96, 178, 224)' ]
    labels: false
    waitForHeightAndWidth: true
    isAnimate: true
    legend: {
      display: false
      position: 'right'
    }
    xAxisMaxTicks: 5
  }

  # accountData helper functions
  $scope.convertToDisplay = (amount) ->
    currency = $scope.settings.displayCurrency
    amount = Wallet.convertFromSatoshi(amount, currency)
    Wallet.formatCurrencyForView(amount, currency)

  $scope.accountFilter = (account) ->
    account.balance > 0 && !account.archived

  $scope.accountSort = (account0, account1) ->
    account1.balance - account0.balance

  $scope.chartDataFormat = (account) ->
    x: account.label
    y: [account.balance]
    tooltip: $scope.convertToDisplay(account.balance)

  $scope.sumReduceAccounts = (prev, current) ->
    balance: prev.balance + current.balance
    label: 'Remaining Accounts'

  # Retrieves account data and formats it for the chart
  $scope.accountData = (numAccounts) ->
    accounts = $scope.accounts()
      .filter($scope.accountFilter)
      .sort($scope.accountSort)

    largestAccounts = accounts.slice(0, numAccounts)

    otherAccounts = accounts.slice(numAccounts)
      .reduce($scope.sumReduceAccounts, { balance: 0 })

    largestAccounts.push(otherAccounts) unless otherAccounts.balance == 0
    largestAccounts.map($scope.chartDataFormat)

  # Call when chart needs to be updated
  $scope.updatePieChartData = () ->
    $scope.pieChartData.data = $scope.accountData(4)

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
      windowClass: "bc-modal small"
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
