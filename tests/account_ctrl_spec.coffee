describe "AccountCtrl", ->
  scope = undefined
  modalInstance =
    close: ->
    dismiss: ->
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, $timeout, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      
      Wallet.login("uid", "pwd")  
      $timeout.flush()
      $timeout.flush()
      
      scope = $rootScope.$new()
            
      $controller "AccountCtrl",
        $scope: scope,
        $stateParams: {},
        $modalInstance: modalInstance
      
      return

    return
    
  it "specs should be logged in by default",  inject((Wallet, $state, $timeout) ->
    expect(scope.status.isLoggedIn).toBe(true)    
  
    return
  )
    
  it "should logout",  inject((Wallet, $state, $timeout) ->
    spyOn(Wallet, "logout").and.callThrough()
    
    scope.logout()
    
    expect(Wallet.logout).toHaveBeenCalled()
    
    expect(scope.status.isLoggedIn).toBe(false)    
    
    return
  )  