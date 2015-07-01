walletApp.controller "UpgradeCtrl", ($scope, Wallet, $modalInstance, $log, $window, $translate, $timeout) ->

  $scope.waiting = true

  $scope.close = () ->
    $modalInstance.close()

  $scope.cancel = () ->
    $window.location = "https://blockchain.info/"

  $timeout ->
    $scope.waiting = false
  , 3000
