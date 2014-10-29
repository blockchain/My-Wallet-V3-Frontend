describe "ChangePasswordCtrl", ->
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
      
      Wallet.login("test", "test")  
      
      scope = $rootScope.$new()
          
      $controller "ChangePasswordCtrl",
        $scope: scope,
        $stateParams: {},
        $modalInstance: modalInstance
      
      scope.fields = {currentPassword: "test", password: "testing", confirmation: "testing"}
      scope.validate()
    
      return

    return
      
  it "should check the original password",  inject(() ->
    expect(scope.isValid).toBe(true)
    
    scope.fields.currentPassword = "test"
    scope.validate()
    expect(scope.isValid).toBe(true)
    
    scope.fields.currentPassword = "wrong"
    scope.validate()
    expect(scope.isValid).toBe(false)
  )
  
  it "should not display error is field is still empty", ->
    scope.validate()
    expect(scope.errors.currentPassword).toBeNull()
    expect(scope.errors.password).toBeNull()
    expect(scope.errors.confirmation).toBeNull()
    
  it "should display an error if password is wrong", ->
    scope.fields.currentPassword = "wrong"
    scope.validate()
    expect(scope.isValid).toBe(false)
    expect(scope.errors.currentPassword).not.toBeNull()
    
  it "should not display an error if new password is still empty", ->
    scope.fields.currentPassword = "test"
    scope.fields.password = ""
    scope.validate()
    expect(scope.isValid).toBe(false)
    expect(scope.errors.password).toBeNull()
    
  it "should display an error if new password is too short", ->
    scope.fields.currentPassword = "test"
    scope.fields.password = "1"
    scope.validate()
    expect(scope.isValid).toBe(false)
    expect(scope.errors.password).not.toBeNull()
    
  it "should not display an error if password confirmation is still empty", ->
    scope.fields.currentPassword = "test"
    scope.fields.password = "testing"
    scope.fields.confirmation = ""
    
    scope.validate()
    
    expect(scope.isValid).toBe(false)
    expect(scope.errors.confirmation).toBeNull()
    
  it "should not display an error if password confirmation matches", ->
    scope.fields.currentPassword = "test"
    scope.fields.password = "testing"
    scope.fields.confirmation = "testing"
    
    scope.validate()
    
    expect(scope.isValid).toBe(true)
    expect(scope.errors.confirmation).toBeNull()
    
  it "should display an error if password confirmation does not match", ->
    scope.fields.currentPassword = "test"
    scope.fields.password = "testing"
    scope.fields.confirmation = "wrong"
    
    scope.validate()
    
    expect(scope.isValid).toBe(false)
    expect(scope.errors.confirmation).not.toBeNull()