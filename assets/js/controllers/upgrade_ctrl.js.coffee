walletApp.controller "UpgradeCtrl", ($scope, Wallet, $modalInstance, $log, $window, $translate) ->  
  $scope.close = () ->
    $translate("RABBIT_HOLE").then (translation) ->
      if confirm translation
        $modalInstance.close()
    
  $scope.cancel = () ->
    $window.location = "https://blockchain.info/"
