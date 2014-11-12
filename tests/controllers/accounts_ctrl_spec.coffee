describe "AccountsCtrl", ->
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
            
      $controller "AccountsCtrl",
        $scope: scope,
        $stateParams: {}
        $modal: modal
      
      return

    return
    
  it "should open modal to create a new account",  inject(() ->
    spyOn(modal, "open")
    scope.newAccount()
    expect(modal.open).toHaveBeenCalled()
  ) 
