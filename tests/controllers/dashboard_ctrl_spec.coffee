describe "DashboardCtrl", ->
  scope = undefined
  
  modal =
    open: ->
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      
      Wallet.login("test", "test")  
      
      
      scope = $rootScope.$new()
            
      $controller "DashboardCtrl",
        $scope: scope,
        $stateParams: {}
        $modal: modal
      
      return

    return
    
  it "specs should be logged in by default",  inject((Wallet, $state) ->
    expect(scope.status.isLoggedIn).toBe(true)    
  
    return
  )
    
  it "should login",  inject((Wallet, $state) ->
    # Logout and reload controller first
    Wallet.logout()

    scope.uid = "user"
    scope.password = "pass"
    
    spyOn(Wallet, "login")
    
    scope.login()
    
    expect(Wallet.login).toHaveBeenCalledWith("user", "pass")
    return
  )
  
  it "should open a modal to create a new wallet",  inject((Wallet, $modal) -> 
    spyOn(modal, "open")
    scope.create()
    expect(modal.open).toHaveBeenCalled()
    
    # scope.uid = "user"
   #  scope.password = "pass"
   #
   #  scope.create()
   #
   #  expect(Wallet.create).toHaveBeenCalledWith("user", "pass")
    
  )
  
    
    