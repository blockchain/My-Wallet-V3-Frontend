@AccountFormCtrl = ($scope, Wallet, $modalInstance, $log, $translate, account) ->        
  $scope.fields = {name: ""}
  $scope.accounts = Wallet.accounts
  $scope.edit = null

  if account?
    $scope.fields.name = account.label
    $scope.edit = true

  $scope.close = () ->
    $modalInstance.dismiss ""
    
  $scope.createAccount = () ->
    if $scope.validate() 
      success = () ->
        $modalInstance.dismiss ""
        
      Wallet.createAccount($scope.fields.name, success)
      
  $scope.updateAccount = () ->
    if $scope.validate() && Wallet.renameAccount(account, $scope.fields.name)
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
  
