@SignupCtrl = ($scope, $log, Wallet, $modalInstance, $translate, $cookieStore, $filter) ->
  $scope.currentStep = 1
  $scope.importing = false
  $scope.languages = Wallet.languages
  $scope.currencies = Wallet.currencies
  $scope.alerts = Wallet.alerts
  
  
  language_guess = $filter("getByProperty")("code", $translate.use(), Wallet.languages)
  
  unless language_guess?
    language_guess =  $filter("getByProperty")("code", "en", Wallet.languages)
   
  currency_guess =  $filter("getByProperty")("code", "USD", Wallet.currencies)

  $scope.fields = {email: "", password: "", confirmation: "", language: language_guess, currency: currency_guess}


  $scope.didLoad = () ->    
    if Wallet.status.isLoggedIn && !Wallet.status.didVerifyEmail
      $scope.currentStep = 4
      
  $scope.didLoad()
  
  $scope.import = () ->
    $scope.currentStep = 3
    
  $scope.performImport = () ->    
    success = () ->
      $scope.currentStep = 4
      $scope.importing = false
      Wallet.displaySuccess("Successfully imported seed")
    
    error = (message) ->
      $scope.importing = false
      Wallet.displayError(message)
  
    $scope.importing = true
  
    Wallet.importWithMnemonic($scope.fields.mnemonic, success, error)      
    
    return
    
  $scope.skipImport = () ->
    $scope.currentStep = 4

  $scope.close = () ->
    Wallet.clearAlerts()
    $modalInstance.dismiss ""
    
  $scope.nextStep = () ->
    $scope.validate()
    if $scope.isValid[$scope.currentStep - 1]
      if $scope.currentStep == 1
        $scope.createWallet((uid)->
          if uid?
            $cookieStore.put("uid", uid)
          # if $scope.savePassword
          #   $cookieStore.put("password", $scope.password)
          $scope.currentStep++
        )
          
      else
        if $scope.currentStep == 1
          $scope.currentStep++
        if $scope.currentStep == 2
          $scope.currentStep = 4 # Skip import step
        
    else
      # console.log "Form step not valid"
      # console.log $scope.currentStep
      # console.log $scope.fields
      
  $scope.createWallet = (success) ->
    Wallet.create($scope.fields.password, $scope.fields.email, $scope.fields.language, $scope.fields.currency, (uid)->
      Wallet.login(uid,$scope.fields.password)
      success()
    )

  $scope.$watch "fields.confirmation", (newVal) ->
    if newVal?
      $scope.validate(false)

  $scope.validate = (visual=true) ->
    isValid = [true, true, true] # [step 1, step 2, step 3]
    
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

  $scope.$watch "fields.language", (newVal, oldVal) ->
    # Update in wallet...
    if newVal?
      $translate.use(newVal.code)
      Wallet.changeLanguage(newVal)
  
  $scope.$watch "fields.currency", (newVal, oldVal) ->
    # Update in wallet...
    if newVal?
      Wallet.changeCurrency(newVal)