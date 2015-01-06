describe "AppCtrl", ->
  scope = undefined
  modalInstance = undefined      
  callbacks = undefined
  modal = undefined
  
  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      
      modalInstance = {
        close: () ->
           modalInstance.confirmCallback()
        dismiss: jasmine.createSpy('modalInstance.dismiss')
        result: {
          then: (confirmCallback, cancelCallback) ->
            modalInstance.confirmCallback = confirmCallback

        }
      }
      
      modal = 
        open: -> 
          modalInstance
    
      spyOn(modal, "open").and.callThrough()
    
      scope = $rootScope.$new()      

      $controller "AppCtrl",
        $scope: scope,
        $modalInstance: modalInstance,
        $modal: modal,
        $stateParams: {}
  
      return

    return
    
  it "should redirect to login if not logged in",  inject((Wallet, $state) ->
    expect(scope.status.isLoggedIn).toBe(false)
    
    spyOn($state, "go")    
    
    scope.$broadcast("$stateChangeSuccess", {name: "dashboard"})
              
    expect($state.go).toHaveBeenCalledWith("login")
  )
  
  it "should not redirect to login if logged in",  inject((Wallet, $state) ->
    Wallet.login("test", "test")  
    expect(scope.status.isLoggedIn).toBe(true)
    
    spyOn($state, "go")    
    
    scope.$broadcast("$stateChangeSuccess", {name: "dashboard"})
    
    expect($state.go).not.toHaveBeenCalled()

  )
  
  describe "HD upgrade", ->
    beforeEach ->

      callbacks =  {
        proceed: () ->
          console.log "proceed"
      }      
      
      spyOn(callbacks, "proceed")
      
      scope.$broadcast("needsUpgradeToHD", callbacks.proceed)
   
    
    it "should show modal if HD upgrade is needed", ->
      expect(modal.open).toHaveBeenCalled()
    

    it "should proceed if user agrees",  ->
      modalInstance.close()
      expect(callbacks.proceed).toHaveBeenCalled()
  
  describe "redeem from email", ->
    it "should proceed after login", inject((Wallet, $rootScope) ->
      Wallet.goal = {claim: {code: "abcd", balance: 100000}}
      
      Wallet.login("test", "test")  
      
      $rootScope.$digest()    
            
      expect(modal.open).toHaveBeenCalled()

    )
