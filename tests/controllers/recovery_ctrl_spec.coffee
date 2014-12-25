describe "RecoveryCtrl", ->
  scope = undefined
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      
      Wallet.login("test", "test")  
      
      scope = $rootScope.$new()
            
      $controller "RecoveryCtrl",
        $scope: scope,
        $stateParams: {},
        
      scope.$digest()
      
      return

    return
    
  describe "recovery phrase", ->   
    it "should be available", inject((Wallet) ->
      pending()
      expect(scope.recoveryPhrase).toEqual("banana big me hungry")
    )
    
    it "is hidden by default", ->
      expect(scope.showRecoveryPhrase).toBe(false)
      
    it "can be shown", ->
      scope.toggleRecoveryPhrase()
      expect(scope.showRecoveryPhrase).toBe(true)      
    
    it "should not be available is 2nd password is enabled", inject((Wallet) ->
      pending()
    )