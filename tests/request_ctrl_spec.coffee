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
      
      scope.fields = {amount: 0, address: null}
            
      $controller "RequestCtrl",
        $scope: scope,
        $stateParams: {},
        $modalInstance: modalInstance
        
      # Trigger generation of payment address:
      scope.fields.amount = 1
      scope.$apply()
      
      return

    return
    
  it "should have access to accounts",  inject(() ->
    expect(scope.accounts).toBeDefined()
    expect(scope.accounts.length).toBeGreaterThan(0)
  )
  
  it "should select first account by default",  inject((Wallet) ->

    expect(Wallet.accounts[0].label).toBe(scope.fields.to.label)
    expect(Wallet.accounts[0].balance).toBe(scope.fields.to.balance)
    expect(Wallet.accounts[0].balance).toBeGreaterThan(0)    
  )
  
  it "should have an address if the request is valid",  inject(() ->
      expect(scope.paymentRequest.address).toBe('1Q57Pa6UQiDBeA3o5sQR1orCqfZzGA7Ddp')
  )
  
  it "should notify the user is payment is received", inject(() ->
    scope.paymentRequest.paid = scope.paymentRequest.amount
    scope.$apply()
    expect(scope.alerts.length).toBe(1)
  )
  
  it "should simulate payment after 10 seconds in mock", inject(($timeout) ->
    expect(scope.alerts.length).toBe(0)    
    $timeout.flush()
    expect(scope.alerts.length).toBe(1)
  )
  
  it "should update amount in request if changed in the form", inject(($timeout) ->
    pending()
  )
  
  it "should delete payment request after payment is complete", inject(($timeout) ->
    pending()
  )