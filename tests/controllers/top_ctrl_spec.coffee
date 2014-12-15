describe "TopCtrl", ->
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
            
      $controller "TopCtrl",
        $scope: scope,
        $stateParams: {},
        $modal: modal
      
      return

    return

  it "should have access to login status",  inject(() ->
    expect(scope.status.isLoggedIn).toBe(true)
  )

  it "should have access to total balance",  inject(() ->
    expect(scope.total).toBeDefined()
  )
  
  it "should open a popup to send",  inject(($modal) ->
    spyOn(modal, "open")
    scope.send()
    expect(modal.open).toHaveBeenCalled()
  )
  
  it "should open a popup to request",  inject(($modal) ->
    spyOn(modal, "open")
    scope.request()
    expect(modal.open).toHaveBeenCalled()
  )
  
  it "should generate a payment request", inject((Wallet) ->
    spyOn(Wallet, "generateOrReuseEmptyPaymentRequestForAccount")
    account = Wallet.accounts[1]
      
    scope.request()
    
    expect(Wallet.generateOrReuseEmptyPaymentRequestForAccount).toHaveBeenCalled()
    
  )