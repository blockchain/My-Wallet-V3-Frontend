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