@SettingsAdvancedCtrl = ($scope, Wallet, $modal, $translate) ->
  $scope.settings = Wallet.settings
  $scope.processToggleRememberTwoFactor = null
  $scope.errors = 
    ipWhitelist: null
    
  $scope.validatePbkdf2 = (candidate) ->
    n = parseInt(candidate)
    return false if isNaN(candidate) || candidate < 1
    return true
    
  $scope.validateIpWhitelist = (candidates) ->
    $scope.errors.ipWhitelist = null
    
    return false unless candidates? && candidates != ""
    if candidates.length > 255
      $translate("MAX_CHARACTERS", {max: 255}).then (translation) ->
        $scope.errors.ipWhitelist = translation
      return false 
    candidatesArray = candidates.split(",")
    if candidatesArray.length > 16
      $translate("MAX_IP_ADDRESSES", {max: 16}).then (translation) ->
        $scope.errors.ipWhitelist = translation
      return false 
    for candidate in candidatesArray
      if candidate.trim() == "%.%.%.%"
        $translate("NOT_ALLOWED", {forbidden:  "%.%.%.%"}).then (translation) ->
          $scope.errors.ipWhitelist = translation
      digits_or_wildcards = candidate.trim().split(".")
      return false if digits_or_wildcards.length != 4
      for digit_or_wildcard in digits_or_wildcards
        if digit_or_wildcard == "%"
        else  
          digit = parseInt(digit_or_wildcard) 
          return false if isNaN(digit) || digit < 0 || digit > 255          
   
    return true
    
    
  $scope.changePbkdf2 = (n, success, errorCallback) ->
    error = () ->
      Wallet.displayError("Failed to update PBKDF2 iterations")
      errorCallback()
      
    Wallet.setPbkdf2Iterations(n, success, error)
    
  $scope.changeIpWhitelist = (list, success, errorCallback) ->
    error = () ->
      Wallet.displayError("Failed to update IP whitelist")
      errorCallback()
    
    Wallet.setIPWhitelist(list, success, error)

  $scope.enableRememberTwoFactor = () ->
    $scope.processToggleRememberTwoFactor = true
    
    success = () ->
      $scope.processToggleRememberTwoFactor = false
    
    error = () ->
      $scope.processToggleRememberTwoFactor = false
    
    Wallet.enableRememberTwoFactor(success, error)
  
  $scope.disableRememberTwoFactor = () ->
    $scope.processToggleRememberTwoFactor = true
    
    success = () ->
      $scope.processToggleRememberTwoFactor = false
    
    error = () ->
      $scope.processToggleRememberTwoFactor = false
    
    Wallet.disableRememberTwoFactor(success, error) 