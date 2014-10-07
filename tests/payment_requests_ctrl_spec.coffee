describe "PaymentRequestsCtrl", ->
  scope = undefined
  
  modal =
    open: ->
  
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
        $modal: modal
      
      return

    return
    
  it "should show incomplete payment requests",  inject((Wallet) ->
    Wallet.generatePaymentRequestForAccount(0, 1)
    expect(scope.requests.length).toBe(1)
  )
  
  it "should open a popup with the payment request",  inject((Wallet, $modal) ->
    Wallet.generatePaymentRequestForAccount(0, 1)
    req = scope.requests[0]
    spyOn(modal, "open")

    scope.open(req)

    expect(modal.open).toHaveBeenCalled()
  )