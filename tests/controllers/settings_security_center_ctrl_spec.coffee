describe "SettingsSecurityCenterCtrl", ->
  scope = undefined
  Wallet = undefined
  
  modal =
    open: ->
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      
      Wallet.login("test", "test")  
      
      Wallet.user.isEmailVerified = false
      
      scope = $rootScope.$new()
            
      $controller "SettingsSecurityCenterCtrl",
        $scope: scope,
        $stateParams: {},
        $modal: modal
        
      scope.$digest()
      
      return

    return
    
  describe "level", ->   
    it "nothing should be default", ->
      expect(scope.level).toBe(0)
    
    
    it "basic requires a verified email address", ->
      scope.user.isEmailVerified = true
      scope.$digest()
      expect(scope.level).toBe(1)
    
    
    it "mid level requires 2FA, a verified mobile and a confirmed recovery phrase", ->
      # Level 1:
      scope.user.isEmailVerified = true
      
      
      scope.settings.needs2FA = true
      scope.user.isMobileVerified = true
      scope.status.didConfirmRecoveryPhrase = true
      
      scope.$digest()
      expect(scope.level).toBe(2)
      
    it "mid level can be reached via any sequence", ->
      scope.settings.needs2FA = true
      scope.$digest()
      scope.user.isMobileVerified = true
      scope.status.didConfirmRecoveryPhrase = true
      scope.$digest()
      scope.user.isEmailVerified = true
      scope.$digest()
      expect(scope.level).toBe(2)

    it "secure requires 2nd password, block TOR and no money in imported addresses", inject((filterFilter)->
      # Level 2:
      scope.user.isEmailVerified = true
      scope.settings.needs2FA = true
      scope.user.isMobileVerified = true
      scope.status.didConfirmRecoveryPhrase = true
      
      # Level 3:
      scope.settings.secondPassword = true
      scope.$digest()
      expect(scope.level).toBe(2)
          
      scope.settings.blockTOR = true
      scope.$digest()
      expect(scope.level).toBe(2)
      
      legacyAddresses = filterFilter(scope.legacyAddresses, {active: true, isWatchOnlyLegacyAddress: false})
      
      for address in legacyAddresses
        address.balance = 0
        console.log "Set to zero:"
        console.log address
        
      # Dummy transaction to trigger the watcher:
      scope.transactions.push {}
      
      scope.$digest()
      expect(scope.level).toBe(3)
    )
    
    it "should be increased if the right conditions are met", ->
      pending()

  describe "actions", ->
    it "...", ->
      pending()
      
    it "...", inject(($modal) ->
      pending()
    )