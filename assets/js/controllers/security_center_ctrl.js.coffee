@SettingsSecurityCenterCtrl = ($scope, Wallet, SecurityCenter, filterFilter, $modal) ->
  $scope.security = SecurityCenter.security
  
  $scope.settings = Wallet.settings
  $scope.user = Wallet.user
  $scope.status = Wallet.status
      
  $scope.legacyAddresses = []
  $scope.unfilteredLegacyAddresses = Wallet.legacyAddresses
  
  $scope.display = {action: null}

  $scope.greaterThan = (prop, val) ->
    (item) ->
      if item[prop] > val
        true

  $scope.$watchCollection "status.legacyAddressBalancesLoaded", ->
    if $scope.legacyAddresses.length == 0 && $scope.status.legacyAddressBalancesLoaded == true
      for address in filterFilter(filterFilter($scope.unfilteredLegacyAddresses, {active: true, isWatchOnlyLegacyAddress: false}), $scope.greaterThan('balance', 50000))
        $scope.legacyAddresses.push address

  $scope.transactions = Wallet.transactions
          
  $scope.transfer = (address) ->
    $modal.open(
      templateUrl: "partials/send.jade"
      controller: SendCtrl
      resolve:
        paymentRequest: -> 
          {fromAddress: address, amount: 0, toAccount: Wallet.accounts[Wallet.getDefaultAccountIndex()]}
    )
    
  $scope.toggle = (action) ->
    if $scope.display.action == action
      $scope.display.action = null
    else
      $scope.display.action = action
      
  $scope.changePasswordHint = (hint, success, error) ->
    Wallet.changePasswordHint(hint, success, error)    
    
  $scope.$watchCollection "user", (newValue, oldValue) ->
    $scope.nextAction()
    
  $scope.$watchCollection "settings", (newValue, oldValue) ->
    $scope.nextAction()
    
  $scope.$watchCollection "status", (newValue, oldValue) ->
    $scope.nextAction()
    
  $scope.nextAction = () ->
    $scope.display.action = null
    if !$scope.user.isEmailVerified
      $scope.toggle('email')
    else if !$scope.status.didConfirmRecoveryPhrase
      $scope.toggle('securityphrase')
    else if !$scope.user.passwordHint
      $scope.toggle('passwordhint')
    else if !$scope.user.isMobileVerified
      $scope.toggle('mobilenumber')
    else if !$scope.settings.needs2FA
      $scope.toggle('twofactor')
    # else if !$scope.settings.blockIE
    #   $scope.toggle('blockie')
    else if !$scope.settings.blockTOR
      $scope.toggle('blocktor')
    
