@SignupCtrl = ($scope, $log, Wallet, $modalInstance, $translate, $cookieStore, $filter, $state) ->
  $scope.currentStep = 1
  $scope.working = false
  $scope.languages = Wallet.languages
  $scope.currencies = Wallet.currencies
  $scope.alerts = Wallet.alerts
  $scope.resendingEmailCode = false
  
  $scope.isValid = [true, true, false, false]
  
  
  
  language_guess = $filter("getByProperty")("code", $translate.use(), Wallet.languages)
  
  unless language_guess?
    language_guess =  $filter("getByProperty")("code", "en", Wallet.languages)
   
  currency_guess =  $filter("getByProperty")("code", "USD", Wallet.currencies)

  $scope.fields = {email: "", password: "", confirmation: "", language: language_guess, currency: currency_guess, mnemonic: "", bip39phrase: "", emailVerificationCode: ""}
  $scope.errors = {emailVerificationCode: null}

  $scope.didLoad = () ->    
    if Wallet.status.isLoggedIn && !Wallet.status.didVerifyEmail
      $scope.currentStep = 4
      
     if $scope.beta 
       $scope.fields.email = $scope.beta.email
      
  $scope.didLoad()
  
  $scope.import = () ->
    $scope.currentStep = 3
    
  $scope.performImport = () ->    
    success = () ->
      $scope.currentStep = 4
      $scope.working = false
      Wallet.displaySuccess("Successfully imported seed")
    
    error = (message) ->
      $scope.working = false
      Wallet.displayError(message)
  
    $scope.working = true
  
    Wallet.importWithMnemonic($scope.fields.mnemonic, $scope.fields.bip39phrase, success, error)      
    
    return
    
  $scope.skipImport = () ->
    $scope.currentStep = 4

  $scope.close = () ->
    Wallet.clearAlerts()
    $modalInstance.dismiss ""
    $state.go("wallet.common.transactions", {accountIndex: "accounts"})
    
  $scope.tryNextStep = () ->
    if $scope.isValid[0]
      $scope.nextStep()

  $scope.nextStep = () ->
    $scope.validate()
    if $scope.isValid[$scope.currentStep - 1]
      if $scope.currentStep == 1
        $scope.working = true
        
        $scope.createWallet((uid)->
          $scope.working = false
          if uid?
            $cookieStore.put("uid", uid)
          # if $scope.savePassword
          #   $cookieStore.put("password", $scope.password)
          $scope.currentStep++
        ) 
      else
        if $scope.currentStep == 1
          $scope.currentStep++
        else if $scope.currentStep == 2
          $scope.errors.emailVerificationCode = null
          
          success = () ->
            $scope.close ""
          
          error = () ->
            $translate("EMAIL_VERIFICATION_FAILED").then (translation) ->
              $scope.errors.emailVerificationCode = translation
          
          Wallet.verifyEmail($scope.fields.emailVerificationCode, success, error)
                
    else
      # console.log "Form step not valid"
      # console.log $scope.currentStep
      # console.log $scope.fields
      
  $scope.createWallet = (successCallback) ->
    Wallet.create($scope.fields.password, $scope.fields.email, $scope.fields.language, $scope.fields.currency, (uid)->
      successCallback()        
    )
    
  $scope.resendEmail = () ->
    $scope.resendingEmailCode = true
    
    success = () ->
      $scope.resendingEmailCode = false
      
    error = () ->
      Wallet.displayError("Unable to resend confirmation email")
      $scope.resendingEmailCode = false
      
    Wallet.resendEmailConfirmation(success, error) 

  $scope.$watch "fields.confirmation", (newVal) ->
    if newVal? && $scope.fields.password != ""
      $scope.validate(false)

  $scope.validate = (visual=true) ->
    # [step 1, step 2, step 4]
    
    $scope.isValid[0] = true
    $scope.isValid[1] = true
    $scope.isValid[3] = true
    
    
    $scope.errors = {email: null, password: null, confirmation: null}
    $scope.success = {email: false, password: false, confirmation: false}    
        
    if $scope.fields.email == ""
      $scope.isValid[0] = false
      $translate("EMAIL_ADDRESS_REQUIRED").then (translation) ->
        $scope.errors.email = translation
    else if $scope.form && $scope.form.$error.email
      $scope.isValid[0] = false
      $translate("EMAIL_ADDRESS_INVALID").then (translation) ->
        $scope.errors.email = translation
    else 
       $scope.success.email = true
    
    if $scope.form && $scope.form.$error
      if $scope.form.$error.minEntropy
        $scope.isValid[0] = false
        $translate("TOO_WEAK").then (translation) ->
          $scope.errors.password =  translation  
      if $scope.form.$error.maxlength
        $scope.isValid[0] = false
        $translate("TOO_LONG").then (translation) ->
          $scope.errors.password =  translation
    
    if $scope.fields.confirmation == ""
      $scope.isValid[0] = false
    else
      if $scope.fields.confirmation == $scope.fields.password
        $scope.success.confirmation = true
      else
        $scope.isValid[0] = false
        if visual
          $translate("NO_MATCH").then (translation) ->
            $scope.errors.confirmation = translation
            
    if $scope.fields.emailVerificationCode == ""
      $scope.isValid[3] = false
                          
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
    
  $scope.$watch "fields.mnemonic", (newValue) ->
    $scope.isValid[2] = Wallet.isValidBIP39Mnemonic($scope.fields.mnemonic)
    
  