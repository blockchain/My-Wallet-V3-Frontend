describe "AppCtrl", ->
  scope = undefined
  callbacks = undefined
  mockModalInstance = undefined
  
  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      
      mockModalInstance = 
        result: then: (confirmCallback, cancelCallback) ->
          #Store the callbacks for later when the user clicks on the OK or Cancel button of the dialog
          @confirmCallBack = confirmCallback
          @cancelCallback = cancelCallback
          return
        close: (item) ->
          #The user clicked OK on the modal dialog, call the stored confirm callback with the selected item
          @result.confirmCallBack item
          return
        dismiss: (type) ->
          #The user clicked cancel on the modal dialog, call the stored cancel callback
          @result.cancelCallback type
          return
      
      scope = $rootScope.$new()      

      $controller "AppCtrl",
        $scope: scope,
        $stateParams: {}
  
      return

    return
    
  it "should redirect to login if not logged in",  inject((Wallet, $state) ->
    expect(scope.status.isLoggedIn).toBe(false)
    
    spyOn($state, "go")    
    
    scope.$broadcast("$stateChangeSuccess", {name: "dashboard"})
              
    expect($state.go).toHaveBeenCalledWith("login.show")
  )
  
  it "should not redirect to login if logged in",  inject((Wallet, $state) ->
    Wallet.login("test", "test")  
    expect(scope.status.isLoggedIn).toBe(true)
    
    spyOn($state, "go")    
    
    scope.$broadcast("$stateChangeSuccess", {name: "dashboard"})
    
    expect($state.go).not.toHaveBeenCalled()

  )
  
  it "should open a popup to send",  inject(($modal) ->
    spyOn($modal, "open")
    scope.send()
    expect($modal.open).toHaveBeenCalled()
  )
  
  it "should open a popup to request",  inject(($modal) ->
    spyOn($modal, "open")
    scope.request()
    expect($modal.open).toHaveBeenCalled()
  )
    
  describe "HD upgrade", ->
    beforeEach ->

      callbacks =  {
        proceed: () ->
          console.log "proceed"
      }      
      
      spyOn(callbacks, "proceed")
    
    it "should show modal if HD upgrade is needed", inject(($modal) ->
      spyOn($modal, "open").and.callThrough()
      
      scope.$broadcast("needsUpgradeToHD", callbacks.proceed)
      expect($modal.open).toHaveBeenCalled()
    )
    

    it "should proceed if user agrees", inject(($modal, $q) ->
      spyOn($modal, 'open').and.returnValue(mockModalInstance)
      
      scope.$broadcast("needsUpgradeToHD", callbacks.proceed)
      
      mockModalInstance.close()
        
      expect(callbacks.proceed).toHaveBeenCalled()
    )
  
  describe "redeem from email", ->
    it "should proceed after login", inject((Wallet, $rootScope, $timeout, $modal) ->
      
      spyOn($modal, 'open').and.returnValue(mockModalInstance)
      
      Wallet.goal.claim = {code: "abcd", balance: 100000}
      
      Wallet.login("test", "test")  
      
      $rootScope.$digest()    
      
      $timeout.flush() # Modal won't open otherwise
            
      expect($modal.open).toHaveBeenCalled()

    )
