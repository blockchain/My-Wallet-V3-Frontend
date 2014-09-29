@RequestCtrl = ($scope, Wallet, $modalInstance) ->
  
  $scope.close = () ->
    $modalInstance.dismiss ""
  
  #################################
  #           Private             #
  #################################