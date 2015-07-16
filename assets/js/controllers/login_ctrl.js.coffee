walletApp.controller "LoginCtrl", ($scope, $rootScope, $log, $http, Wallet, $cookieStore, $modal, $state, $timeout, $translate, filterFilter) ->
  $scope.status = Wallet.status
  $scope.settings = Wallet.settings

  $scope.disableLogin = null

  $scope.status.enterkey = false
  $scope.key = $cookieStore.get("key")

  $scope.errors = {uid: null, password: null, twoFactor: null}

  $scope.uidAvailable = $cookieStore.get('uid')?

  # Browser compatibility warnings:
  # * Secure random number generator: https://developer.mozilla.org/en-US/docs/Web/API/RandomSource/getRandomValues
  # * AngularJS support (?)

  if browserDetection().browser == "ie"
    if browserDetection().version < 11
      $translate("MINIMUM_BROWSER", {browser: "Internet Explorer", requiredVersion: 11, userVersion: browserDetection().version}).then (translation) ->
        Wallet.displayError(translation, true)
      $scope.disableLogin = true
    else
      $translate("WARN_AGAINST_IE").then (translation) ->
        Wallet.displayWarning(translation, true)
  else if browserDetection().browser == "chrome"
    if browserDetection().version < 11
      $translate("MINIMUM_BROWSER", {browser: "Chrome", requiredVersion: 11, userVersion: browserDetection().version}).then (translation) ->
        Wallet.displayError(translation, true)
      $scope.disableLogin = true
  else if browserDetection().browser == "firefox"
    if browserDetection().version < 21
      $translate("MINIMUM_BROWSER", {browser: "Firefox", requiredVersion: 21, userVersion: browserDetection().version}).then (translation) ->
        Wallet.displayError(translation, true)
      $scope.disableLogin = true
  else if browserDetection().browser == "safari"
    if browserDetection().version < 3
      $translate("MINIMUM_BROWSER", {browser: "Safari", requiredVersion: 3, userVersion: browserDetection().version}).then (translation) ->
        Wallet.displayError(translation, true)
      $scope.disableLogin = true
  else if browserDetection().browser == "opera"
    if browserDetection().version < 15
      $translate("MINIMUM_BROWSER", {browser: "Opera", requiredVersion: 15, userVersion: browserDetection().version}).then (translation) ->
        Wallet.displayError(translation, true)
      $scope.disableLogin = true
  else
    # Warn against unknown browser. Tell user to pay attention to random number generator and CORS protection.
    $translate("UNKNOWN_BROWSER").then (translation) ->
      Wallet.displayWarning(translation, true)

  if Wallet.guid?
    $scope.uid = Wallet.guid
  else
    $scope.uid = $cookieStore.get("uid")

  if $scope.key?
    $scope.status.enterkey = true

  if $cookieStore.get('email-verified')
    $cookieStore.remove 'email-verified'
    $translate("SUCCESS").then (titleTranslation) ->
      $translate("EMAIL_VERIFIED_SUCCESS").then (messageTranslation) ->
        modalInstance = $modal.open(
          templateUrl: "partials/modal-notification.jade"
          controller: "ModalNotificationCtrl"
          windowClass: "notification-modal"
          resolve:
            notification: ->
              {
                type: 'verified-email'
                icon: 'ti-email'
                heading: titleTranslation
                msg: messageTranslation
              }
          )

  $scope.twoFactorCode = ""
  $scope.busy = false
  $scope.isValid = false

  if !!$cookieStore.get("password")
    $scope.password = $cookieStore.get("password")

  $scope.login = () ->
    return if $scope.busy

    $scope.busy = true
    Wallet.clearAlerts()

    error = (field, message) ->
      $scope.busy = false
      if field == "uid"
        $scope.errors.uid = message
      else if field == "password"
        $scope.errors.password = message
      else if field == "twoFactor"
        $scope.errors.twoFactor = message

    needs2FA = () ->
      $scope.busy = false
      $scope.didAsk2FA = true

    success = () ->
      $scope.busy = false

    if $scope.settings.needs2FA
      Wallet.login($scope.uid, $scope.password, $scope.twoFactorCode, (() ->), success, error)
    else
      Wallet.login($scope.uid, $scope.password, null, needs2FA, success, error)

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

  $scope.prepareRegister = () ->
    if $rootScope.beta
      $scope.status.enterkey = !$scope.status.enterkey
    else
      $scope.register()

  $scope.register = () ->
    betaCheckFinished = (key, email) ->
      $rootScope.beta = {key: $scope.key, email: email}

      $state.go("register")

    $cookieStore.remove 'key'
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
      $state.go("register")

  $scope.numberOfActiveAccounts = () ->
    return filterFilter(Wallet.accounts, {archived: false}).length

  $scope.$watch "status.isLoggedIn", (newValue) ->
    if newValue
      $scope.busy = false
      $state.go("wallet.common.dashboard")

  $scope.$watch "uid + password + twoFactor", () ->
    $scope.errors.uid = null
    $scope.errors.password = null
    $scope.errors.twoFactor = null

    isValid = null

    if !$scope.uid? || $scope.uid == ""
      isValid = false

    if !$scope.password? || $scope.password == ""
      isValid = false

    if $scope.settings.needs2FA && $scope.twoFactorCode == ""
      isValid = false

    if !isValid?
      isValid = true

    $scope.isValid = isValid
