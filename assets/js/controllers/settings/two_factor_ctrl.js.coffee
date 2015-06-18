walletApp.controller "TwoFactorCtrl", ($scope, Wallet, $modalInstance, $translate, $timeout) ->

  $scope.settings = Wallet.settings
  $scope.user = Wallet.user

  steps = ['disable', 'disabled', 'enable', 'configure_mobile', 'pair', 'confirm_sms', 'success', 'loading', 'error']

  $scope.step = if $scope.settings.needs2FA then 'disable' else 'enable'
  $scope.pairWith = 'authenticator'
  $scope.fields = { authenticatorCode: '', yubiKeyCode: '' }
  $scope.errors = {}
  $scope.status = {}
  $scope.alerts = []

  $scope.mobileNumber = {step: 1}

  $scope.closeAlert = (alert) ->
    $scope.alerts.splice $scope.alerts.indexOf(alert)

  $scope.displayConfirmationError = () ->
    return unless $scope.alerts.length == 0
    $translate('2FA_INVALID').then (translation) ->
      alert = {type: 'danger', msg: translation}
      alert.timer = $timeout (->
        $scope.alerts.splice $scope.alerts.indexOf(alert)
      ), 7000
      $scope.alerts.push(alert)

  $scope.validateCode = (pairWith) ->
    if pairWith == 'yubiKey'
      return $scope.fields.yubiKeyCode.length > 0
    else if pairWith == 'authenticator'
      return $scope.fields.authenticatorCode.length == 6
    return false

  $scope.disableTwoFactor = () ->
    return unless $scope.settings.needs2FA
    Wallet.disableSecondFactor()
    $scope.goToStep('disabled')

  $scope.setTwoFactorSMS = () ->
    if $scope.user.isMobileVerified
      Wallet.setTwoFactorSMS()

  $scope.setTwoFactorGoogleAuthenticator = () ->
    Wallet.setTwoFactorGoogleAuthenticator()

  $scope.confirmTwoFactorGoogleAuthenticator = (code) ->
    success = () ->
      return unless $scope.isStep('pair')
      $scope.goToStep('success')
    error = () ->
      $scope.displayConfirmationError()
      $scope.errors.authenticatorCode = true
      $scope.status.loading = false
    Wallet.confirmTwoFactorGoogleAuthenticator(code, success, error)

  $scope.setTwoFactorYubiKey = (key) ->
    success = () ->
      return unless $scope.isStep('pair')
      $scope.goToStep('success')
    error = () ->
      $scope.errors.yubiKeyCode = true
      $scope.status.loading = false
    Wallet.setTwoFactorYubiKey(key, success, error)

  $scope.pairWithApp = (pairWith) ->
    return unless $scope.validateCode(pairWith)
    if pairWith == 'yubiKey'
      $scope.setTwoFactorYubiKey($scope.fields.yubiKeyCode)
    else if pairWith == 'authenticator'
      $scope.confirmTwoFactorGoogleAuthenticator($scope.fields.authenticatorCode)
    else
      return $scope.goToStep('error')
    $scope.status.loading = true

  # UI Navigation

  $scope.goToStep = (step) ->
    return unless step in steps
    $scope.step = step

  $scope.isStep = (step) ->
    $scope.step == step

  $scope.authWithPhone = () ->
    if $scope.user.isMobileVerified
      $scope.goToStep('loading')
      $scope.setTwoFactorSMS()
    else
      $scope.goToStep('configure_mobile')

  $scope.authWithApp = () ->
    $scope.goToStep('pair')
    $scope.setTwoFactorGoogleAuthenticator()

  $scope.close = () ->
    Wallet.clearAlerts()
    $modalInstance.dismiss ""

  $scope.$watch 'user.isMobileVerified', (newVal, oldVal) ->
    if newVal && $scope.isStep('configure_mobile')
      $scope.goToStep('loading')
      $scope.setTwoFactorSMS()

  $scope.$watch 'settings.twoFactorMethod', (newVal, oldVal) ->
    return unless $scope.isStep('loading')
    if newVal > 0
      $scope.goToStep('success')
    else
      $scope.goToStep('disabled')