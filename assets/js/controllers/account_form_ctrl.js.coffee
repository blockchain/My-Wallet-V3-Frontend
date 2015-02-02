@AccountFormCtrl = ($scope, Wallet, $modalInstance, $log, $translate, account) ->        
  $scope.fields = {name: ""}
  $scope.accounts = Wallet.accounts
  $scope.status =
    edit: false
    busy: null

  if account?
    $scope.fields.name = account.label
    $scope.status.edit = true

  $scope.close = () ->
    $modalInstance.dismiss ""
    
  $scope.createAccount = () ->
    if $scope.validate() 
      $scope.status.busy = true
      
      success = () ->
        $scope.status.busy = false
        $modalInstance.dismiss ""
        
      error = () ->
        $scope.status.busy = false
        
      Wallet.createAccount($scope.fields.name, success, error)
      
  $scope.updateAccount = () ->
    
    if $scope.validate() 
      $scope.status.busy = true
      
      success = () ->
        $scope.status.busy = false
        $modalInstance.dismiss ""
        
      error = () ->
        $scope.status.busy = false
      
      Wallet.renameAccount(account, $scope.fields.name, success, error)

  #################################
  #           Private             #
  #################################
      
  $scope.$watch "fields.name", () ->
    $scope.formIsValid = $scope.validate()

  $scope.validate = () ->
    return false if $scope.fields.name == null
    return false if $scope.fields.name.length == 0
    
    return true
  
