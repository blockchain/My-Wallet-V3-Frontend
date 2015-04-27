@LoginCtrl = ($scope, $rootScope, $log, $http, Wallet, $cookieStore, $modal, $state, $timeout, $translate) ->
  $scope.status = Wallet.status    
  $scope.settings = Wallet.settings
  
  # Browser compatibility warnings:
  if browserDetection().browser == "ie"
    if browserDetection().version < 10
      $translate("MINIMUM_IE_10", {version: browserDetection().version}).then (translation) ->
        Wallet.displayError(translation, true)
    else  
      $translate("WARN_AGAINST_IE").then (translation) ->
        Wallet.displayWarning(translation, true)
    
  # # Browser performance warnings:
  # if browserDetection().browser == "firefox"
  #   $translate("WARN_FIREFOX_NO_WEB_WORKERS").then (translation) ->
  #     Wallet.displayWarning(translation, true)
  #
  # if browserDetection().browser == "ie" && browserDetection().version == 10
  #   $translate("WARN_IE_10_NO_WEB_WORKERS").then (translation) ->
  #     Wallet.displayWarning(translation, true)
  
  if Wallet.guid?
    $scope.uid = Wallet.guid
  else
    $scope.uid = $cookieStore.get("uid")
  
  
  $scope.twoFactorCode = ""
  $scope.busy = false  
  $scope.isValid = false
  
  if !!$cookieStore.get("password")      
    $scope.password = $cookieStore.get("password")
  
  $scope.login = () ->
    return if $scope.busy
    
    $scope.busy = true
    Wallet.clearAlerts()
    
    error = () ->
      $scope.busy = false
    
    needs2FA = () ->
      $scope.busy = false
      
    success = () ->
      $scope.busy = false
            
    if !$scope.settings.needs2FA
      Wallet.login($scope.uid, $scope.password, null, needs2FA, success, error)
    else if $scope.twoFactorCode != ""
      Wallet.login($scope.uid, $scope.password, $scope.twoFactorCode, needs2FA, success, error)
      
    if $scope.uid? && $scope.uid != ""
      $cookieStore.put("uid", $scope.uid)

    if $scope.savePassword && $scope.password? && $scope.password != ""
       $cookieStore.put("password", $scope.password)
       
  $scope.resend = () ->
    if Wallet.settings.twoFactorMethod == 5
      $scope.resending = true
    
      success = () ->
        $scope.resending = false
      
      error = () ->
        $scope.resending = false
      
      Wallet.resendTwoFactorSms($scope.uid,success, error)
      
  $scope.register = () ->
    # If BETA=1 is set in .env then in index.html/jade $rootScope.beta is set.
    # The following checks are not ideal as they can be bypassed with some creative Javascript commands.
    if $rootScope.beta
      # Check if there is an invite code associated with
      $http.post("/check_beta_key_unused", {key: $scope.key}
      ).success((data) ->
        if(data.verified) 
          betaCheckFinished(data.key, data.email)
        else
          if(data.error && data.error.message)
            Wallet.displayError(data.error.message)
      ).error () ->
        Wallet.displayError("Unable to verify your invite code.")
        
    else
      betaCheckFinished()
      
    betaCheckFinished = (key, email) ->
      $rootScope.beta = {key: $scope.key, email: email}

      $state.go("register")

  $scope.$watch "status.isLoggedIn", (newValue) ->
    if newValue
      $scope.busy = false
      
      # $state.go("wallet.common.dashboard")
      $state.go("wallet.common.transactions", {accountIndex: "accounts"})
      
  $scope.$watch "uid + password", () ->
    isValid = null
    
    if !$scope.uid? || $scope.uid == ""
      isValid = false
      
    if !$scope.password? || $scope.password == ""
      isValid = false

    if !isValid?
      isValid = true
      
    $scope.isValid = isValid      