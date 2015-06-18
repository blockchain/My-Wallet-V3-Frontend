walletApp.controller "ChangePasswordCtrl", ($scope, $log, Wallet, $modalInstance, $translate) ->
  
  $scope.fields = {currentPassword: "", password: "", confirmation: ""}

  $scope.errors = {}
  $scope.status = {}

  $scope.isCorrectMainPassword = Wallet.isCorrectMainPassword

  $scope.isNotGuid = (candidate) ->
    return !(candidate == Wallet.uid)

  $scope.passwordsMatch = () ->
    return $scope.fields.confirmation == $scope.fields.password

  $scope.changePassword = () ->
    return unless $scope.passwordForm.$valid && $scope.passwordsMatch()
    success = () ->
      $modalInstance.dismiss ""
    error = (err) ->
      $scope.status.waiting = false
      $scope.errors.unsuccessful = err
    $scope.status.waiting = true
    Wallet.changePassword($scope.fields.password, success, error)

  $scope.close = () ->
    Wallet.clearAlerts()
    $modalInstance.dismiss ""