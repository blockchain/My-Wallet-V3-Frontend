walletApp.controller "HomeCtrl", ($scope, $window, Wallet, $modal) ->
  $scope.accounts = Wallet.accounts
  $scope.status = Wallet.status
  $scope.transactions = []

  $scope.accountLabels = () ->
    $scope.accounts().map (account) -> account.label

  $scope.accountBalances = () ->
    $scope.accounts().map (account) -> account.balance

  $scope.updateDoughnutChart = () ->
    $scope.accounts().map ((account) -> 
      if account.balance?
        return account.balance
    )

  $scope.options = showTooltips : true # (2) NOT WORKING AS OF YET...TODO:LABELS

  # Watchers
  $scope.$watch 'status.didLoadTransactions', (didLoad) ->
    $scope.transactions = Wallet.transactions if didLoad

  $scope.$watchCollection 'accounts()', () ->
    $scope.data = $scope.updateDoughnutChart()
    if $scope.data.length < 3
      $scope.data.push 0
    return

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
