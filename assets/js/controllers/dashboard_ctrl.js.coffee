walletApp.controller "DashboardCtrl", ($scope, Wallet, $log, $modal) ->
  $scope.accounts = Wallet.accounts
  $scope.status = Wallet.status

  if $scope.status.firstTime
    modalInstance = $modal.open(
      templateUrl: "partials/first-login-modal.jade"
      controller: "FirstTimeCtrl"
      resolve:
        firstTime: ->
          Wallet.status.firstTime = false
      windowClass: "bc-modal rocket-modal"
    )
