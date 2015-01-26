@SettingsAdvancedCtrl = ($scope, Wallet, $modal) ->
  $scope.settings = Wallet.settings
    
  $scope.validatePbkdf2 = (candidate) ->
    n = parseInt(candidate)
    return false if isNaN(candidate) || candidate < 1
    return true
    
  $scope.validateIpWhitelist = (candidates) ->
    return false unless candidates? && candidates != ""
    for candidate in candidates.split(",")
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
