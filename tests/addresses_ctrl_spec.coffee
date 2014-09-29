describe "AddressesCtrl", ->
  scope = undefined
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, $timeout, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      
      Wallet.login("uid", "pwd")  
      $timeout.flush()
      $timeout.flush()
      
      scope = $rootScope.$new()
            
      $controller "AddressesCtrl",
        $scope: scope,
        $stateParams: {}
      
      return

    return
    
  it "should let user create a new address", ->
    expect(scope.addresses.length).toBe(0)
    scope.generateAddress()
    expect(scope.addresses.length).toBe(1)
    
  
    
    