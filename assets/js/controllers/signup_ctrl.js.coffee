@SignupCtrl = ($scope, $log, Wallet, $modalInstance, $translate, $cookieStore) ->
  $scope.currentStep = 1
  
  $scope.fields = {email: "", password: "", confirmation: "", language: null, currency: null}

  $scope.languages = Wallet.languages
  $scope.currencies = Wallet.currencies
  $scope.alerts = Wallet.alerts

  $scope.didLoad = () ->    
    if Wallet.status.isLoggedIn && !Wallet.status.didVerifyEmail
      $scope.currentStep = 3
      
  $scope.didLoad()

  $scope.close = () ->
    Wallet.clearAlerts()
    $modalInstance.dismiss ""
    
  $scope.nextStep = () ->
    $scope.validate()
    if $scope.isValid[$scope.currentStep - 1]
      if $scope.currentStep == 2
        $scope.createWallet((uid)->
          $cookieStore.put("uid", uid)
          if $scope.savePassword
            $cookieStore.put("password", $scope.password)
          $scope.currentStep++
        )
          
      else
        $scope.currentStep++
    else
      # console.log "Form step not valid"
      # console.log $scope.currentStep
      # console.log $scope.fields
      
  $scope.createWallet = (success) ->
    Wallet.create($scope.fields.password, $scope.fields.email, $scope.fields.language, $scope.fields.currency, ()->
      success()
    )

  $scope.$watch "fields.confirmation", (newVal) ->
    if newVal?
      $scope.validate(false)

  $scope.validate = (visual=true) ->
    isValid = [true, true] # [step 1, step 2]
    
    $scope.errors = {email: null, password: null, confirmation: null}
    $scope.success = {password: false, confirmation: false}    
          
    if $scope.fields.password == ""
      isValid[0] = false
    else
      if $scope.fields.password.length > 3
        $scope.success.password = true
      else
        isValid[0] = false
        if visual
          $translate("TOO_SHORT").then (translation) ->
            $scope.errors.password = translation
      
    if $scope.fields.confirmation == ""
      isValid[0] = false
    else
      if $scope.fields.confirmation == $scope.fields.password
        $scope.success.confirmation = true
      else
        isValid[0] = false
        if visual
          $translate("NO_MATCH").then (translation) ->
            $scope.errors.confirmation = translation
            
    $scope.isValid = isValid      
  
  $scope.validate()
