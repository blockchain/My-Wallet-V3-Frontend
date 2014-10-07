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
      
      scope.request = {to: 0, amount: 0, address: null}
            
      $controller "RequestCtrl",
        $scope: scope,
        $stateParams: {},
        $modalInstance: modalInstance
        
      # Trigger generation of payment address:
      scope.request.amount = 1
      scope.$apply()
      
      return

    return

  it "should have access to accounts",  inject(() ->
    expect(scope.accounts).toBeDefined()
    expect(scope.accounts.length).toBeGreaterThan(0)
  )
  
  it "should have an address if the request is valid",  inject(() ->
      expect(scope.request.address).toBe('1Q57Pa6UQiDBeA3o5sQR1orCqfZzGA7Ddp')
  )
  
  it "should notify the user is payment is received", inject(($timeout) ->
    $timeout.flush()
    expect(scope.alerts.length).toBe(1)
  )