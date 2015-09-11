walletApp.controller "HomeCtrl", ($q, $scope, $window, Wallet, $modal) ->
  $scope.accounts = Wallet.accounts
  $scope.balanceHistory = Wallet.balanceHistory
  $scope.status = Wallet.status
  $scope.settings = Wallet.settings
  $scope.conversions = Wallet.conversions
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

  $scope.lineChartData = {}

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

  $scope.balanceHistoryDataFormat = (entry, forceBTC) ->
    unless forceBTC
      currency = $scope.settings.currency
      if currency and currency.code
        # Check that there is a valid conversion
        conversion = $scope.conversions[currency.code]
        if conversion and conversion.conversion > 0
          return $q (resolve, reject) ->
            Wallet.getFiatAtTime(entry.balance, entry.timestamp, currency.code).then(resolve, reject)
          .then (amount) ->
            return {
              x: entry.date
              y: [parseFloat(amount)]
              tooltip: conversion.symbol + amount
            }

    currency = $scope.settings.displayCurrency
    amount = Wallet.convertFromSatoshi(entry.balance, currency)
    return $q.when({
      x: entry.date
      y: [amount]
      tooltip: $scope.convertToDisplay(entry.balance)
    })

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

  $scope.balanceHistoryData = (forceBTC = false) ->
    history = Wallet.balanceHistory()

    history.sort (a, b) ->
      if a.timestamp > b.timestamp
        return 1
      else if a.timestamp < b.timestamp
        return -1
      else
        return 0

    # TODO: Internationalize this
    month = [
      "Jan"
      "Feb"
      "Mar"
      "Apr"
      "May"
      "Jun"
      "Jul"
      "Aug"
      "Sep"
      "Oct"
      "Nov"
      "Dec"
    ]

    # Loop through history and only display the last balance for each day
    seenDates = []
    consolidatedHistory = []

    for entry in history
      date = new Date(entry.timestamp)
      entry.date = (month[date.getMonth()] + ' ' + date.getDate())

      if entry.date in seenDates
        consolidatedHistory[consolidatedHistory.length - 1] = entry
      else
        seenDates.push entry.date
        consolidatedHistory.push entry

    promises = []

    for entry in consolidatedHistory
      promises.push $scope.balanceHistoryDataFormat(entry, forceBTC)

    return $q.all(promises)

  # Call when chart needs to be updated
  $scope.updatePieChartData = () ->
    $scope.pieChartData.data = $scope.accountData(4)

  $scope.updateLineChartData = () ->
    $scope.balanceHistoryData().then (data) ->
      $scope.lineChartData = { series: [''], data: data }
    , (error) ->
      $scope.balanceHistoryData(true).then (data) ->
        $scope.lineChartData = { series: [''], data: data }

  # Watchers
  loadedTxs = $scope.$watch 'status.didLoadTransactions', (didLoad) ->
    return unless didLoad
    $scope.transactions = Wallet.transactions
    loadedTxs()

  loadedBalances = $scope.$watch 'status.didLoadBalances', (didLoad) ->
    return unless didLoad
    $scope.updatePieChartData()
    loadedBalances()

  loadedBalanceHistory = $scope.$watch 'status.didLoadBalanceHistory', (didLoad) ->
    return unless didLoad
    $scope.updateLineChartData()
    loadedBalanceHistory()

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
