walletApp.controller "SettingsAdvancedCtrl", ($scope, Wallet, $modal, $translate) ->
  $scope.settings = Wallet.settings
  $scope.processToggleRememberTwoFactor = null
  $scope.errors =
    ipWhitelist: null

  $scope.validatePbkdf2 = (candidate) ->
    n = parseInt(candidate)
    return false if isNaN(candidate)
    return false if n < 1
    return false if n > 20000
    return true

  $scope.validateLogoutTime = (candidate) ->
    n = parseInt(candidate)
    return false if isNaN(candidate) || n > 1440
    return false unless n >= 1
    return true

  $scope.validateIpWhitelist = (candidates) ->
    $scope.errors.ipWhitelist = null

    return false unless candidates?
    return true if candidates == ""

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
        return false
      digits_or_wildcards = candidate.trim().split(".")
      return false if digits_or_wildcards.length != 4
      for digit_or_wildcard in digits_or_wildcards
        if digit_or_wildcard == "%"
        else
          digit = parseInt(digit_or_wildcard)
          return false if isNaN(digit) || digit < 0 || digit > 255

    return true


  $scope.changePbkdf2 = (n, successCallback, errorCallback) ->
    success = () ->
      successCallback()

    error = () ->
      Wallet.displayError("Failed to update PBKDF2 iterations")
      errorCallback()

    cancel = () ->
      errorCallback()

    Wallet.setPbkdf2Iterations(n, success, error, cancel)

  $scope.changeLogoutTime = (m, success, errorCallback) ->
    error = () ->
      Wallet.displayError("Failed to update auto logout time")
      errorCallback()

    Wallet.setLogoutTime(m, success, error)

  $scope.changeIpWhitelist = (list, success, errorCallback) ->
    error = () ->
      Wallet.displayError("Failed to update IP whitelist")
      errorCallback()

    Wallet.setIPWhitelist(list, success, error)

  $scope.toggleApiAccess = () ->
    Wallet.setApiAccess(!$scope.settings.apiAccess)

  $scope.toggleLogging = () ->
    level = if $scope.settings.loggingLevel == 0 then 1 else 0
    Wallet.setLoggingLevel(level)

  $scope.enableRememberTwoFactor = () ->
    $scope.processToggleRememberTwoFactor = true

    success = () ->
      $scope.processToggleRememberTwoFactor = false
      Wallet.saveActivity(2)

    error = () ->
      $scope.processToggleRememberTwoFactor = false

    Wallet.enableRememberTwoFactor(success, error)

  $scope.disableRememberTwoFactor = () ->
    $scope.processToggleRememberTwoFactor = true

    success = () ->
      $scope.processToggleRememberTwoFactor = false
      Wallet.saveActivity(2)

    error = () ->
      $scope.processToggleRememberTwoFactor = false

    Wallet.disableRememberTwoFactor(success, error)
