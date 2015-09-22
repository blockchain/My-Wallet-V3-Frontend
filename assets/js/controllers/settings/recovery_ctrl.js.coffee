angular.module('walletApp').controller "RecoveryCtrl", ($scope, Wallet, $state, $translate) ->
  $scope.recoveryPhrase = null
  $scope.recoveryPassphrase = null
  $scope.showRecoveryPhrase = false
  $scope.editMnemonic = false
  $scope.status = Wallet.status

  $scope.isValidMnemonic = Wallet.isValidBIP39Mnemonic

  $scope.toggleRecoveryPhrase = () ->
    if !$scope.showRecoveryPhrase
      success = (mnemonic, passphrase) ->
        $scope.recoveryPhrase = mnemonic
        $scope.recoveryPassphrase = passphrase
        $scope.showRecoveryPhrase = true

      error = (message) ->

      Wallet.getMnemonic(success, error)
    else
      $scope.recoveryPhrase = null
      $scope.recoveryPassphrase = null
      $scope.showRecoveryPhrase = false

  $scope.importRecoveryPhrase = () ->
    $scope.editMnemonic = true

  $scope.performImport = () ->

    success = () ->
      $scope.importing = false
      $scope.editMnemonic = false
      $scope.mnemonic = null
      $state.go("wallet.common.transactions", accountIndex: "accounts")
      Wallet.displaySuccess("Successfully imported seed")

    error = (message) ->
      $scope.importing = false
      Wallet.displayError(message)

    cancel = () ->
      $scope.importing = false

    if confirm("You will lose all your bitcoins! Are you sure?")
      $scope.importing = true
      Wallet.importWithMnemonic($scope.mnemonic, $scope.passphrase, success, error, cancel)

    return

  $scope.doNotCopyPaste = (event) ->
    event.preventDefault()
    $translate("DO_NOT_COPY_PASTE").then (translation) ->
      Wallet.displayWarning translation
