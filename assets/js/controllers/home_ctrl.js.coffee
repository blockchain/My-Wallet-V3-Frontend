walletApp.controller "HomeCtrl", ($scope, $window, Wallet, $modal) ->
  $scope.accounts = Wallet.accounts
  $scope.status = Wallet.status
  $scope.transactions = []

  $scope.chartData = {
    series: []
    data: []
  }

  $scope.accountLabels = () ->
    # $scope.accounts().map (account) -> account.label
    # Needs to follow the below format
    return ["Label1", "Label2", "Label3"]
  $scope.accountData = () ->
    # $scope.accounts().map (account) -> account.balance
    # Needs to follow the below format
    return [{ x: "Label1", y: [10]}, { x: "Label2", y: [20]}, { x: "Label3", y: [30]}]

  $scope.updateDoughnutChart = () ->
    $scope.chartData.data = $scope.accountData()
    $scope.chartData.series = $scope.accountLabels()

  $scope.config = {
    colors: ['RGB(102, 209, 233)', 'RGB(107, 158, 232)', 'RGB(212, 238, 249)']
    legend: {
      display: true,
      position: 'right'
    }
  }

  console.log($scope.chartData)

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
