@AccountFormCtrl = ($scope, Wallet, $modalInstance, $log, $translate, account, $modal) ->        
  $scope.fields = {name: ""}
  $scope.accounts = Wallet.accounts
  $scope.status =
    edit: false
    busy: null

  $scope.errors = {}
  
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
        
        modalInstance = $modal.open(
          templateUrl: "partials/modal-notification.jade"
          controller: ModalNotificationCtrl
          windowClass: "notification-modal"
          resolve:
            notification: ->
              {
                type: 'created-account'
                icon: 'ti-layout-list-post'
                heading: 'Success!'
                msg: "You've successfully created an account"
              }
        )
        
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
    $scope.errors.name = null
    
    return false if $scope.fields.name == null
    return false if $scope.fields.name.length == 0
    
    if $scope.fields.name.length > 17
      $scope.errors.name = "Max. 17 characters"
      return false
    
    return true
  
