walletApp.controller 'RecoverFundsCtrl', ($scope, $rootScope, $state, $timeout, Wallet) ->
  $scope.currentStep = 1
  $scope.fields = {
    email: '',
    password: '',
    confirmation: '',
    mnemonic: '',
    bip39phrase: ''
  }
  $scope.isValidMnemonic = Wallet.isValidBIP39Mnemonic

  $scope.performImport = () ->
    $scope.working = true

    success = (wallet) ->
      $rootScope.beta = false #temporary hack to circumvent beta check
      $scope.working = false
      $scope.nextStep()
      $rootScope.$safeApply()

      loginSuccess = () ->
        Wallet.displaySuccess('Successfully recovered wallet!')
      loginError = (err) ->
        console.error err

      $timeout(() ->
        $state.go('login.show')
        Wallet.login(wallet.guid, wallet.password, null, null, loginSuccess, loginError)
      , 4000)

    error = (message) ->
      Wallet.displayError(message)

    Wallet.my.recoverFromMnemonic(
      $scope.fields.email,
      $scope.fields.password,
      $scope.fields.mnemonic,
      $scope.fields.bip39phrase,
      success,
      error)

  $scope.nextStep = () ->
    $scope.currentStep++

  $scope.goBack = () ->
    $scope.currentStep--
