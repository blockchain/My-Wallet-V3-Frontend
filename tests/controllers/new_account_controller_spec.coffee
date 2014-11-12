describe "NewAccountCtrl", ->
  scope = undefined
  modalInstance =
    close: ->
    dismiss: ->
        
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, localStorageService, $rootScope, $controller) ->
      localStorageService.remove("mockWallets")
      
      Wallet = $injector.get("Wallet")      
            
      MyWallet = $injector.get("MyWallet")
            
      scope = $rootScope.$new()
          
      $controller "NewAccountCtrl",
        $scope: scope,
        $stateParams: {},
        $modalInstance: modalInstance
      
      scope.fields = {name: "Savings"}
      scope.$digest()
    
      return

    return
    
  it "should be created",  inject((Wallet) ->
    before = Wallet.accounts.length
    scope.createAccount()
    expect(Wallet.accounts.length).toBe(before + 1)
  )
  
  it "should have a name",  inject((Wallet) ->
    scope.createAccount()
    expect(Wallet.accounts[Wallet.accounts.length - 1].label).toBe("Savings")
  )
  
  it "name should be 1 character or more",  inject((Wallet) ->
    expect(scope.formIsValid).toBe(true)
    scope.fields.name = ""
    scope.$digest()
    expect(scope.formIsValid).toBe(false)
    
  )