walletApp.controller "SettingsMyDetailsCtrl", ($scope, Wallet, $modal, $filter, $translate) ->
  $scope.edit = {email: false, password: false, passwordHint: false}
  $scope.user = Wallet.user
  $scope.settings = Wallet.settings
  $scope.errors = {}

  $scope.mobileNumber = {step: 0}
  $scope.uid = Wallet.user.uid

  $scope.changeEmail = (email, success, error) ->
    Wallet.changeEmail(email, success, error)

  $scope.changePasswordHint = (hint, successCallback, errorCallback) ->
    success = () ->
      $scope.clearErrors()
      successCallback()
    error = (err) ->
      if err == 101
        $translate('PASSWORD_HINT_ERROR').then (translation) ->
          $scope.errors.passwordHint = translation
      errorCallback(err)
    Wallet.changePasswordHint(hint, success, error)

  $scope.changePassword = () ->
    modalInstance = $modal.open(
      templateUrl: "partials/settings/change-password.jade"
      controller: "ChangePasswordCtrl"
      windowClass: "bc-modal"
    )
    if modalInstance?
      modalInstance.opened.then () ->
        Wallet.store.resetLogoutTimeout()

  $scope.changeTwoFactor = () ->
    modalInstance = $modal.open(
      templateUrl: "partials/settings/two-factor.jade"
      controller: "TwoFactorCtrl"
      windowClass: "bc-modal"
    )
    if modalInstance?
      modalInstance.opened.then () ->
        Wallet.store.resetLogoutTimeout()

  $scope.clearErrors = () ->
    $scope.errors = {}
