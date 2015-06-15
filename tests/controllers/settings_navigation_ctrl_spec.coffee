describe "SettingsNavigationCtrl", ->
  scope = undefined
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      
      Wallet.login("test", "test")  
      
      scope = $rootScope.$new()
            
      $controller "SettingsNavigationCtrl",
        $scope: scope,
        $stateParams: {},
        
      scope.$digest()
      
      return

    return

  it "specs should be logged in by default",  inject((Wallet, $state) ->
    expect(scope.status.isLoggedIn).toBe(true)
    return
  )

  describe "the Go Back function", ->
    it "should be defined", ->
      expect(scope.goHome).toBeDefined()

    it "should take me back tothe home page", inject((Wallet, $state)-> 
      spyOn($state, "go")
      scope.goHome()
      expect($state.go).toHaveBeenCalled()
      return
  )
