@UpgradeCtrl = ($scope, Wallet, $modalInstance, $log, $window) ->  
  $scope.close = () ->
    if confirm "Are you sure you wish to know how deep the rabbit hole goes?"
      $modalInstance.close()
    
  $scope.cancel = () ->
    $window.location = "https://blockchain.info/"