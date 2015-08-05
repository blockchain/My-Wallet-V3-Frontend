walletApp.controller "HomeCtrl", ($scope, $window, Wallet, $modal) ->
  $scope.accounts = Wallet.accounts
  $scope.status = Wallet.status

  $scope.transactions = []
  $scope.chartData = { balances: [], labels: [] }

  # (2) NOT WORKING AS OF YET...TODO:LABELS
  $scope.options = { showTooltips: true }

  $scope.accountLabels = () ->
    $scope.accounts().map (account) -> account.label

  $scope.accountBalances = () ->
    $scope.accounts().map (account) -> account.balance

  $scope.updateDoughnutChart = () ->
    $scope.chartData.balances = $scope.accountBalances()
    $scope.chartData.labels = $scope.accountLabels()

  # Watchers
  $scope.$watch 'status.didLoadTransactions', (didLoad) ->
    return unless didLoad
    $scope.transactions = Wallet.transactions

  $scope.$watch 'status.didLoadBalances', (didLoad) ->
    return unless didLoad
    $scope.updateDoughnutChart()

  $scope.$watchCollection 'accounts()', (accounts) ->
    return unless accounts.length > 0
    $scope.updateDoughnutChart()

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
