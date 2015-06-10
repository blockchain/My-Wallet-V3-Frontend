@TwoFactorCtrl = ($scope, Wallet, $modalInstance, $translate) ->

  $scope.settings = Wallet.settings
  $scope.user = Wallet.user

  steps = ['disable', 'disabled', 'enable', 'configure_mobile', 'pair', 'confirm_sms', 'success', 'loading', 'error']

  $scope.step = if $scope.settings.needs2FA then 'disable' else 'enable'
  $scope.pairWith = 'authenticator'
  $scope.fields = { authenticatorCode: '', yubiKeyCode: '' }
  $scope.errors = {}

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
      return unless $scope.isStep('loading')
      $scope.goToStep('success')
    error = () ->
      $scope.errors.authenticatorCode = true
      $scope.goToStep('pair')
    Wallet.confirmTwoFactorGoogleAuthenticator(code, success, error)

  $scope.setTwoFactorYubiKey = (key) ->
    success = () ->
      return unless $scope.isStep('loading')
      $scope.goToStep('success')
    error = () ->
      $scope.errors.yubiKeyCode = true
      $scope.goToStep('pair')
    Wallet.setTwoFactorYubiKey(key, success, error)

  $scope.pairWithApp = (pairWith) ->
    return unless $scope.validateCode(pairWith)
    if pairWith == 'yubiKey'
      $scope.setTwoFactorYubiKey($scope.fields.yubiKeyCode)
    else if pairWith == 'authenticator'
      $scope.confirmTwoFactorGoogleAuthenticator($scope.fields.authenticatorCode)
    else
      return $scope.goToStep('error')
    $scope.goToStep('loading')

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