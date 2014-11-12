@NewAccountCtrl = ($scope, Wallet, $modalInstance, $log, $translate) ->        

  $scope.fields = {name: ""}

  $scope.close = () ->
    $modalInstance.dismiss ""
    
  $scope.createAccount = () ->
    if $scope.validate() && Wallet.createAccount($scope.fields.name)
      $modalInstance.dismiss ""

  #################################
  #           Private             #
  #################################
      
  $scope.$watch "fields.name", () ->
    $scope.formIsValid = $scope.validate()

  $scope.validate = () ->
    return false if $scope.fields.name == null
    return false if $scope.fields.name.length == 0
    
    return true
  
