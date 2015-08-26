walletApp.controller "UpgradeCtrl", ($scope, Wallet, $modalInstance, $log, $window, $translate, $timeout) ->

  $scope.waiting = true
  $scope.busy = false


  $scope.upgrade = () ->
    secondPasswordCancelled = () ->
      # Keep trying, user cannot use the wallet without upgrading.
      $scope.insist = true
      $scope.busy = false

    success = () ->
      $scope.busy = false
      $modalInstance.close()

    $scope.insist = false
    $scope.busy = true
    Wallet.upgrade(success, secondPasswordCancelled)

  $scope.cancel = () ->
    $scope.busy = false
    $window.location = "https://blockchain.info/"

  $timeout ->
    $scope.waiting = false
  , 3000
