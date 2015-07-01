walletApp.controller "UpgradeCtrl", ($scope, Wallet, $modalInstance, $log, $window, $translate) ->  
  $scope.close = () ->
    $translate("ARE_YOU_SURE").then (translation) ->
      if confirm translation
        $modalInstance.close()
    
  $scope.cancel = () ->
    $window.location = "https://blockchain.info/"
