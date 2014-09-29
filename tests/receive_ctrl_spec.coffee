describe "RequestCtrl", ->
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
            
      $controller "RequestCtrl",
        $scope: scope,
        $stateParams: {},
        $modalInstance: modalInstance
      
      return

    return
    
  it "should exist",  inject(() ->
    expect(scope.close).toBeDefined() 
  
    return
  )
