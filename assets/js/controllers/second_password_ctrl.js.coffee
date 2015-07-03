walletApp.controller "SecondPasswordCtrl", ($scope, $log, Wallet, $modalInstance, $translate, insist, continueCallback, cancelCallback) ->
  $scope.insist = if insist then true else false
  $scope.alerts = Wallet.alerts

  $scope.busy = false

  $scope.secondPassword = ""

  $scope.cancel = () ->
    Wallet.clearAlerts()
    cancelCallback()
    $modalInstance.dismiss ""

  $scope.submit = () ->
    return if $scope.busy
    $scope.busy = true

    Wallet.clearAlerts()

    correctPassword = () ->
      $scope.busy = false
      $modalInstance.close ""

    wrongPassword = () ->
      $scope.busy = false
      $modalInstance.close ""

    continueCallback($scope.secondPassword, correctPassword, wrongPassword)
