describe "RegistrationCtrl", ->
  scope = undefined

  modal =
   open: (args) ->  
     result:
       then: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
   angular.mock.inject ($injector, $rootScope, $controller) ->
     Wallet = $injector.get("Wallet")
     MyWallet = $injector.get("MyWallet")    
  
     scope = $rootScope.$new()
     
     spyOn(modal, "open").and.callThrough()
        
     $controller "RegistrationCtrl",
       $scope: scope,
       $stateParams: {}
       $modal: modal
  
     return

   return
  
  it "should open a modal to create a new wallet",  inject((Wallet) -> 
    expect(modal.open).toHaveBeenCalled()
  )