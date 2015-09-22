angular.module('walletApp').controller "MobileCtrl", ($scope, Wallet) ->
  $scope.display = {pairingCode: false}
  $scope.pairingCode = null

  $scope.hidePairingCode = () ->
    $scope.pairingCode = null
    $scope.display.pairingCode = false

  $scope.showPairingCode = () ->
    success = (pairingCode) ->
      $scope.pairingCode = pairingCode
      $scope.loading = false
      $scope.display.pairingCode = true

    error = () ->
      Wallet.displayError("Failed to load pairing code.")
      $scope.loading = false

    $scope.loading = true

    Wallet.makePairingCode(success, error)
