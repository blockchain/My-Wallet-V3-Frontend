describe "SettingsNavigationCtrl", ->
  scope = undefined
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      
      Wallet.login("test", "test")  
      
      scope = $rootScope.$new()
            
      $controller "SettingsNavigationCtrl",
        $scope: scope,
        $stateParams: {},
        
      scope.$digest()
      
      return

    return
    
  it "specs should be logged in by default",  inject((Wallet, $state) ->
    expect(scope.status.isLoggedIn).toBe(true)    
  
    return
  )
  
  it "should show payment request item if needed",  inject((Wallet, $state) ->
    expect(scope.walletHasPaymentRequests()).toBe(false)    
    Wallet.generatePaymentRequestForAccount(0, 0.1)
    expect(scope.walletHasPaymentRequests()).toBe(true)    
  
    return
  )
  
  it "should not show payment request item if all payment requests have been cancelled",  inject((Wallet, $state) ->
    Wallet.generatePaymentRequestForAccount(0, 0.1)
    
    address = Wallet.paymentRequests[0].address
    Wallet.cancelPaymentRequest(0, address)
    
    expect(scope.walletHasPaymentRequests()).toBe(false)    
  
    return
  )
  
  
  it "should not show payment request item if all payment requests has been completed",  inject((Wallet, $state) ->
    Wallet.generatePaymentRequestForAccount(0, 0.1)
    
    address = Wallet.paymentRequests[0].address
    Wallet.acceptPaymentRequest(0, address)
    
    expect(scope.walletHasPaymentRequests()).toBe(false)    
  
    return
  )
  
  