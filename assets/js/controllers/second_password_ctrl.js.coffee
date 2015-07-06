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

    if Wallet.validateSecondPassword($scope.secondPassword)
      $scope.busy = false
      $modalInstance.close ""
      continueCallback($scope.secondPassword)
    else
      $scope.busy = false
      $translate("SECOND_PASSWORD_INCORRECT").then (translation) ->
        Wallet.displayError(translation)