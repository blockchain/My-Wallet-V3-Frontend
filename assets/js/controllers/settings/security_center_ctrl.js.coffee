@SettingsSecurityCenterCtrl = ($scope, Wallet, filterFilter) ->
  $scope.level = 0
  $scope.actions = [{}, {}, {}]
  $scope.settings = Wallet.settings
  $scope.user = Wallet.user
  $scope.status = Wallet.status
  $scope.legacyAddresses = Wallet.legacyAddresses
  $scope.transactions = Wallet.transactions
  
  $scope.doSomething = () ->
    if $scope.level < 2
      $scope.level++
      $scope.actions.splice(0,1)
      
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
            return unless address.balance < 30000 # Allow small amounts
            
          
            
          $scope.level = 3
          