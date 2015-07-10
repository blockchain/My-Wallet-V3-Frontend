walletApp.controller "TransactionsCtrl", ($scope, Wallet, MyWallet, $log, $stateParams, $timeout, $state) ->

  $scope.filterTypes = ['ALL', 'SENT_BITCOIN_TO', 'RECEIVED_BITCOIN_FROM', 'MOVED_BITCOIN_TO']

  $scope.setFilterType = (type) ->
    $scope.filterBy = $scope.filterTypes[type]

  $scope.isFilterType = (type) ->
    $scope.filterBy == $scope.filterTypes[type]

  $scope.nextPage = () ->
    return if $scope.allTransactionsLoaded || $scope.loading
    $scope.loading = true

    success = () ->
      $scope.loading = false

    error = () ->
      $scope.loading = false

    allTransactionsLoaded = () ->
      $scope.allTransactionsLoaded = true
      $scope.loading = false

    Wallet.fetchMoreTransactions($stateParams.accountIndex, success, error, allTransactionsLoaded)

  $scope.showTransaction = (transaction) ->
    $state.go("wallet.common.transaction", {accountIndex: $scope.accountIndex, hash: transaction.hash})

  $scope.selectedAccountIndex = $stateParams.accountIndex

  #################################
  #           Private             #
  #################################



  $scope.$watchCollection "accounts", (newValue) ->
    if $scope.accounts.length > 0
      $scope.canDisplayDescriptions = true


  $scope.didLoad = () ->
    $scope.transactions = Wallet.transactions
    $scope.addressBook = Wallet.addressBook
    $scope.status    = Wallet.status
    $scope.settings = Wallet.settings
    $scope.totals = Wallet.totals
    $scope.accountIndex = $stateParams.accountIndex
    $scope.accounts = Wallet.accounts
    $scope.canDisplayDescriptions = false # Don't try to show descriptions for before accounts have been loaded
    $scope.allTransactionsLoaded = false
    $scope.setFilterType(0)
    console.log $scope.transactions

  $scope.transactionFilter = (item) ->
    $scope.filterByLocation(item) && $scope.filterByType(item) && $scope.filterByName(item, $scope.searchText)

  $scope.filterByName = (tx, search) ->
    JSON.stringify(tx).search(search) > -1 || search == '' || !search?

  $scope.filterByType = (tx) ->
    switch $scope.filterBy
      when $scope.filterTypes[0]
        return true
      when $scope.filterTypes[1]
        return tx.result < 0 && !tx.intraWallet
      when $scope.filterTypes[2]
        return tx.result > 0 && !tx.intraWallet
      when $scope.filterTypes[3]
        return tx.intraWallet
    return false

  $scope.filterByLocation = (item) ->
    return item.to.account? || item.from.account? if $stateParams.accountIndex == "accounts"
    return (item.to.legacyAddresses && item.to.legacyAddresses.length) || (item.from.legacyAddresses && item.from.legacyAddresses.length) if $stateParams.accountIndex == "imported"
    return (item.to.account? && item.to.account.index == parseInt($stateParams.accountIndex)) || (item.from.account? && item.from.account.index == parseInt($stateParams.accountIndex))

  $scope.$watch "status.didLoadTransactions", (newValue) ->
     $scope.loading = !newValue

  # First load:
  $scope.didLoad()
