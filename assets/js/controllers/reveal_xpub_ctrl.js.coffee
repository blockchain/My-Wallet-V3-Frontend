walletApp.controller "RevealXpubCtrl", ($scope, Wallet, $modalInstance, $log, $translate, account, $modal) ->

  $scope.accounts = Wallet.accounts

  $scope.xpub = account.extendedPublicKey

  $scope.close = () ->
    $modalInstance.dismiss ""
