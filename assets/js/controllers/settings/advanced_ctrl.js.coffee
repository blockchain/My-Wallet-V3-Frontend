@SettingsAdvancedCtrl = ($scope, Wallet, $modal) ->
  $scope.settings = Wallet.settings
  
  $scope.newIpWhitelist = $scope.settings.ipWhitelist
  
  $scope.edit =   {pbkdf2: false, ipWhitelist: false} 
  $scope.saving = {pbkdf2: false, ipWhitelist: false} 
    
  $scope.validatePbkdf2 = (candidate) ->
    n = parseInt(candidate)
    return false if isNaN(candidate) || candidate < 1
    return true
    
  $scope.changePbkdf2 = (n) ->
    Wallet.setPbkdf2Iterations(n, (()->), (()->))
    $scope.edit.pbkdf2 = false
    
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
    
  $scope.changeIpWhitelist = (list) ->
    $scope.saving.ipWhitelist = true
    
    success = () ->
      $scope.saving.ipWhitelist = false
      $scope.settings.ipWhitelist = list
      $scope.edit.ipWhitelist = false
      
    error = () ->
       $scope.saving.ipWhitelist = false
       Wallet.displayError("Failed to update IP whitelist")
          
    Wallet.setIPWhitelist(list, success, error)
