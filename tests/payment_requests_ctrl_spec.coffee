describe "PaymentRequestsCtrl", ->
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
            
      $controller "PaymentRequestsCtrl",
        $scope: scope,
        $stateParams: {}
      
      return

    return
    
  it "should show incomplete payment requests",  inject((Wallet) ->
    Wallet.generatePaymentRequestForAccount(0, 1)
    Wallet.refreshPaymentRequests()
    expect(scope.requests.length).toBe(1)
  )