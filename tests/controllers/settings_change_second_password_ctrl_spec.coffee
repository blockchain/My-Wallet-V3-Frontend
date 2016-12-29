describe "ManageSecondPasswordCtrl", ->
  scope = undefined
  Wallet = undefined
  MyWallet = undefined
  modal =
    open: ->
  modalInstance =
    close: ->
    dismiss: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller, $compile, $templateCache) ->
      MyWallet = $injector.get("MyWallet")
      Wallet = $injector.get("Wallet")
      Wallet.user.passwordHint = "passhint"
      Wallet.isCorrectMainPassword = (pw) -> pw == 'mainpw'

      MyWallet.wallet =
        external: {}

      scope = $rootScope.$new()
      template = $templateCache.get('partials/settings/manage-second-password.jade')

      $controller "ManageSecondPasswordCtrl",
        $scope: scope,
        $uibModalInstance: modalInstance,
        $uibModal: modal

      scope.model = { fields: {} }
      $compile(template)(scope)
      scope.$digest()

  describe "recovery phrase prompt modal", ->

    it "should open if recovery phrase and second pw are false", ->
      spyOn(modal, "open")
      scope.recoveryModal()
      expect(modal.open).toHaveBeenCalled()

    it "should not open if recovery phrase has been backed up", ->
      spyOn(modal, "open")
      Wallet.status.didConfirmRecoveryPhrase = true
      expect(modal.open).not.toHaveBeenCalled()

    it "should not open if second password has been set already", ->
      spyOn(modal, "open")
      Wallet.settings.secondPassword = true
      expect(modal.open).not.toHaveBeenCalled()

    it "should activate the form if user dismisses prompt", ->
      Wallet.dismissedRecoveryPrompt()
      scope.$digest()
      expect(scope.active).toEqual(true)

  describe "buttons", ->

    it "should show if recovery phrase has been backed up", ->
      scope.walletStatus.didConfirmRecoveryPhrase = true
      expect(scope.showButton()).toEqual(true)

    it "should hide if prompt was dismissed and second PW is present", ->
      scope.walletStatus.dismissedRecoveryPrompt = true
      Wallet.settings.secondPassword = true
      expect(scope.hideButton()).toEqual(true)

    it "should not hide if recovery phrase confirmed but no second PW", ->
      scope.walletStatus.didConfirmRecoveryPhrase = true
      Wallet.settings.secondPassword = false
      expect(scope.hideButton()).toEqual(false)

  describe "password", ->

    it "should be valid if the password is ok", ->
      scope.form.password.$setViewValue('validpw')
      expect(scope.form.password.$valid).toEqual(true)

    it "should reset the confirmations field when changed", ->
      scope.form.confirmation.$setViewValue('conf')
      scope.form.password.$setViewValue('validpw')
      expect(scope.fields.confirmation).toEqual('')

    it "should not be valid if the password is too short", ->
      scope.form.password.$setViewValue('asd')
      expect(scope.form.password.$valid).toEqual(false)
      expect(scope.form.password.$error.minlength).toEqual(true)

    it "should not be valid if the password is the password hint", ->
      scope.form.password.$setViewValue('passhint')
      expect(scope.form.password.$valid).toEqual(false)
      expect(scope.form.password.$error.isValid).toEqual(true)

    it "should not be valid if the password is the main password", ->
      scope.form.password.$setViewValue('mainpw')
      expect(scope.form.password.$valid).toEqual(false)
      expect(scope.form.password.$error.isValid).toEqual(true)

  describe "confirmation", ->

    beforeEach ->
      scope.form.password.$setViewValue('validpw')

    it "should be valid if the confirmation is the same as the password", ->
      scope.form.confirmation.$setViewValue('validpw')
      expect(scope.form.confirmation.$valid).toEqual(true)

    it "should not be valid if the confirmation is different than the password", ->
      scope.form.confirmation.$setViewValue('differentpw')
      expect(scope.form.confirmation.$valid).toEqual(false)
      expect(scope.form.confirmation.$error.isValid).toEqual(true)
