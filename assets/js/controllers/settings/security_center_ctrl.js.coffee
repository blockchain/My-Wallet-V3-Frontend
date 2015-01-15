@SettingsSecurityCenterCtrl = ($scope, Wallet, filterFilter) ->
  $scope.level = 0
  $scope.actions = [{}, {}, {}]
  $scope.settings = Wallet.settings
  $scope.user = Wallet.user
  $scope.status = Wallet.status
  
  $scope.greaterThan = (prop, val) ->
    (item) ->
      if item[prop] > val
        true
  
  $scope.legacyAddresses = filterFilter(filterFilter(Wallet.legacyAddresses, {active: true, isWatchOnlyLegacyAddress: false}), $scope.greaterThan('balance', 50000))
  $scope.transactions = Wallet.transactions
      
  # Check for upgrade to level 1:    
  $scope.$watch "user.isEmailVerified", ->
    $scope.updateLevel()
 
  # Check for upgrade to level 2:     
  $scope.$watch "settings.needs2FA + user.isMobileVerified + status.didConfirmRecoveryPhrase", ->
    $scope.updateLevel()      
    
  # Check for upgrade to level 3 (settings):
  $scope.$watch "settings.secondPassword + settings.blockTOR", ->
    $scope.updateLevel() 
    
  # Check for upgrade to level 3 (transactions that might sweep legacy addresses)
  $scope.$watchCollection "transactions", ->
    $scope.updateLevel()
  
  # The user may perform these steps in any order, so we need to check for all levels after each change:
  $scope.updateLevel = () ->
    $scope.level = 0
    if $scope.user.isEmailVerified
      $scope.level = 1
    
      if $scope.settings.needs2FA && $scope.user.isMobileVerified && $scope.status.didConfirmRecoveryPhrase
        $scope.level = 2
        
        if $scope.settings.blockTOR && $scope.settings.secondPassword
          legacyAddresses = filterFilter($scope.legacyAddresses, {active: true, isWatchOnlyLegacyAddress: false})
      
          for address in legacyAddresses
            return unless address.balance < 50000 # Allow small amounts
  
          $scope.level = 3
          
  $scope.transfer = (address) ->
    $modal.open(
      templateUrl: "partials/send.jade"
      controller: SendCtrl
      resolve:
        paymentRequest: -> 
          {fromAddress: address, amount: 0, toAccount: Wallet.accounts[Wallet.getDefaultAccountIndex()]}
    )