@TwoFactorCtrl = ($scope, Wallet, $modalInstance, $translate) ->

  $scope.close = () ->
    Wallet.clearAlerts()
    $modalInstance.dismiss ""