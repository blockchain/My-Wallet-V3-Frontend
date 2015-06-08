@ChangePasswordCtrl = ($scope, $log, Wallet, $modalInstance, $translate) ->
  
  $scope.isValid = false
  
  $scope.fields = {currentPassword: "", password: "", confirmation: ""}
  
  $scope.form = {}

  $scope.close = () ->
    Wallet.clearAlerts()
    $modalInstance.dismiss ""

  $scope.changePassword = () ->
    Wallet.changePassword($scope.fields.password)
    $modalInstance.dismiss ""
    
  $scope.$watch "fields.confirmation", (newVal) ->
    if newVal?
      $scope.validate(false)

  $scope.validate = (visual=true) ->
    isValid = true
    
    $scope.errors = {currentPassword: null, password: null, confirmation: null}
    $scope.success = {currentPassword: false, password: false, confirmation: false}    
        
    if $scope.fields.currentPassword == ""
      isValid = false
    else
      if Wallet.isCorrectMainPassword($scope.fields.currentPassword)
        $scope.success.currentPassword = true
      else
        isValid = false
        if visual
          $translate("INCORRECT").then (translation) ->
            $scope.errors.currentPassword = translation
    if $scope.form.theForm? 
      if $scope.form.theForm.password.$error.minEntropy
        isValid = false
        $translate("TOO_WEAK").then (translation) ->
          $scope.errors.password =  translation  
      if $scope.form.theForm.password.$error.maxlength
        isValid = false
        $translate("TOO_LONG").then (translation) ->
          $scope.errors.password =  translation
      if $scope.fields.password == Wallet.uid
        isValid = false
        $translate("CANT_USE_GUID").then (translation) ->
          $scope.errors.password =  translation
    if $scope.fields.confirmation == ""
      isValid = false
    else
      if $scope.fields.confirmation == $scope.fields.password
        $scope.success.confirmation = true
      else
        isValid = false
        if visual
          $translate("NO_MATCH").then (translation) ->
            $scope.errors.confirmation = translation
            
    $scope.isValid = isValid      
  
  $scope.validate()
