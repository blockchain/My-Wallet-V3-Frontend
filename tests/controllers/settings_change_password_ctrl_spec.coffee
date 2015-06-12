describe "ChangePasswordCtrl", ->
  scope = undefined
  Wallet = undefined
  modalInstance =
    close: ->
    dismiss: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      Wallet.login("test", "test")  

      scope = $rootScope.$new()

      $controller "ChangePasswordCtrl",
        $scope: scope,
        $stateParams: {},
        $modalInstance: modalInstance

      scope.fields = {currentPassword: "test", password: "t3$tp@s$w0rd", confirmation: "t3$tp@s$w0rd"}

      scope.$digest()

      return

    return

  it "should be able to close", inject((Wallet) ->
    spyOn(Wallet, "clearAlerts")
    scope.close()
    expect(Wallet.clearAlerts).toHaveBeenCalled()
  )

  it "should be able to change password", inject((Wallet) ->
    spyOn(Wallet, "changePassword")
    scope.changePassword()
    expect(Wallet.changePassword).toHaveBeenCalled()
  )

  describe "validate", ->

    beforeEach ->
      scope.form.theForm = 
        password: $error: {}

    it "should not display an error if new password is still empty", ->
      scope.fields.currentPassword = "test"
      scope.fields.password = ""
      scope.validate()
      expect(scope.isValid).toBe(false)
      expect(scope.errors.password).toBeNull()
      
    it "should display an error if the new password is too weak", ->
      scope.fields.currentPassword = "test"
      scope.form.theForm.password.$error.minEntropy = true
      scope.validate()
      expect(scope.isValid).toBe(false)
      expect(scope.errors.password).not.toBeNull()

    it "should display an error if the new password is too long", ->
      scope.fields.currentPassword = "test"
      scope.form.theForm.password.$error.maxlength = true
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

    it "should check the original password",  inject(() ->
      expect(scope.isValid).toBe(true)
      
      scope.fields.currentPassword = "test"
      scope.validate()
      expect(scope.isValid).toBe(true)
      
      scope.fields.currentPassword = "wrong"
      scope.validate()
      expect(scope.isValid).toBe(false)
    )

    it "should display an error if password is wrong", ->
      scope.fields.currentPassword = "wrong"
      scope.validate()
      expect(scope.isValid).toBe(false)
      expect(scope.errors.currentPassword).not.toBeNull()

    it "should not display error is field is still empty", ->
      scope.validate()
      expect(scope.errors.currentPassword).toBeNull()
      expect(scope.errors.password).toBeNull()
      expect(scope.errors.confirmation).toBeNull()

    it "should fail if main password is incorrect", inject((Wallet) ->
      spyOn(Wallet, "changePassword")
      scope.fields.currentPassword = 'wrong'
      scope.changePassword()
      expect(Wallet.changePassword).not.toHaveBeenCalled()
    )

    it "should fail if new password is the guid", inject((Wallet) ->
      spyOn(Wallet, "changePassword")
      scope.fields.password = 'test'
      scope.fields.confirmation = 'test'
      scope.changePassword()
      expect(Wallet.changePassword).not.toHaveBeenCalled()
    )

    it "should fail if new passwords do not match", inject((Wallet) ->
      spyOn(Wallet, "changePassword")
      scope.fields.password = 'foo'
      scope.fields.confirmation = 'bar'
      scope.changePassword()
      expect(Wallet.changePassword).not.toHaveBeenCalled()
    )