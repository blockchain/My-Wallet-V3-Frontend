walletApp.controller "SecondPasswordCtrl", ($scope, $log, Wallet, $modalInstance, $translate, insist, defer) ->
  $scope.insist = if insist then true else false
  $scope.alerts = Wallet.alerts

  $scope.busy = false

  $scope.secondPassword = ""

  $scope.cancel = () ->
    defer.reject($translate.instant('SECOND_PASSWORD_CANCEL'))
    Wallet.clearAlerts()
    $modalInstance.dismiss ""

  $scope.submit = () ->
    return if $scope.busy
    $scope.busy = true

    Wallet.clearAlerts()

    if Wallet.validateSecondPassword($scope.secondPassword)
      $scope.busy = false
      defer.resolve($scope.secondPassword)
      $modalInstance.close ""
    else
      $scope.busy = false
      $translate("SECOND_PASSWORD_INCORRECT").then (translation) ->
        Wallet.displayError(translation)
