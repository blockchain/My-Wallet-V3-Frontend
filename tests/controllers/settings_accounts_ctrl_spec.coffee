describe "SettingsAccountsCtrl", ->
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
            
      $controller "SettingsAccountsCtrl",
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
  
  it "should list accounts",  inject(() ->
    expect(scope.accounts.length).toBe(2)
  )
  
  it "should open modal to edit an account",  inject(() ->
    account = scope.accounts[0]
    spyOn(modal, "open")
    scope.editAccount(account)
    expect(modal.open).toHaveBeenCalled()
  )
  
  it "should show a bitcoin address", inject((Wallet) ->
    spyOn(modal, "open")
    spyOn(Wallet, "generateOrReuseEmptyPaymentRequestForAccount")
    account = Wallet.accounts[1]
      
    scope.showAddress(account)
    
    expect(Wallet.generateOrReuseEmptyPaymentRequestForAccount).toHaveBeenCalled()
    expect(modal.open).toHaveBeenCalled()
    
  )