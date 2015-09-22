angular.module('walletApp').controller "RevealXpubCtrl", ($scope, Wallet, $modalInstance, $log, $translate, account, $modal) ->
  $scope.accounts = Wallet.accounts
  $scope.showXpub = false
  $scope.xpub = account.extendedPublicKey

  $scope.continue = () ->
    $scope.showXpub = true

  $scope.close = () ->
    $modalInstance.dismiss ""
