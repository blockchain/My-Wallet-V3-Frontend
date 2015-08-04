walletApp.controller "HomeCtrl", ($scope, $window, Wallet, $modal) ->
  $scope.accounts = Wallet.accounts
  $scope.status = Wallet.status
  $scope.transactions = []

  $scope.accountLabels = () ->
    $scope.accounts().map (account) -> account.label

  $scope.accountBalances = () ->
    $scope.accounts().map (account) -> account.balance

  # Watchers
  $scope.$watch 'status.didLoadTransactions', (didLoad) ->
    $scope.transactions = Wallet.transactions if didLoad

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
