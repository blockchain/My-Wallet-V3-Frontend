describe "LoginCtrl", ->
  scope = undefined

  modal =
   open: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
   angular.mock.inject ($injector, $rootScope, $controller) ->
     Wallet = $injector.get("Wallet")
     MyWallet = $injector.get("MyWallet")    

  
     scope = $rootScope.$new()
        
     $controller "LoginCtrl",
       $scope: scope,
       $stateParams: {}
       $modal: modal
  
     return

   return
   
  it "should login",  inject((Wallet) ->
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
  )
  