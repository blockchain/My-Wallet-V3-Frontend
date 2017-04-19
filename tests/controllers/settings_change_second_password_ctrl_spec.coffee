describe "ManageSecondPasswordCtrl", ->
  scope = undefined
  Wallet = undefined
  MyWallet = undefined
  $timeout = undefined

  modal =
    open: ->
    close: ->
    dismiss: ->
  modalInstance =
    close: ->
    dismiss: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller, $compile, $templateCache) ->
      $timeout = $injector.get("$timeout")
      MyWallet = $injector.get("MyWallet")
      Wallet = $injector.get("Wallet")
      Wallet.user.passwordHint = "passhint"
      Wallet.isCorrectMainPassword = (pw) -> pw == 'mainpw'
      Wallet.validateSecondPassword = (pw) -> pw == 'secpass'

      MyWallet.wallet =
        external: {}

      scope = $rootScope.$new()
      scope.settings = Wallet.settings
      template = $templateCache.get('partials/settings/manage-second-password.pug')

      $controller "ManageSecondPasswordCtrl",
        $scope: scope,
        $uibModalInstance: modalInstance,
        # $uibModal: modal

      scope.model = { fields: {} }
      $compile(template)(scope)
      scope.$digest()

  describe "recovery phrase prompt modal", ->

    it "should open if called", inject(($uibModal) ->
      spyOn($uibModal, "open").and.callThrough()
      Wallet.status.didConfirmRecoveryPhrase = false
      Wallet.settings.secondPassword = false
      scope.recoveryModal()
      expect($uibModal.open).toHaveBeenCalled()
    )

    it "should close the modal on dismissal and open recovery", inject(($uibModal, $q) ->
      spyOn($uibModal, "open").and.returnValue( {result: $q.resolve()} )
      spyOn(scope, "openRecovery")
      scope.recoveryModal()
      scope.$digest()
      expect(scope.openRecovery).toHaveBeenCalled()
    )

    it "should not open if recovery phrase has been backed up", inject(($uibModal, $q) ->
      spyOn($uibModal, "open")
      Wallet.status.didConfirmRecoveryPhrase = true
      scope.recoveryModal()
      scope.$digest()
      expect($uibModal.open).not.toHaveBeenCalled()
    )

    it "should not open if second password has been set already", inject(($uibModal, $q) ->
      spyOn(modal, "open")
      Wallet.settings.secondPassword = true
      scope.recoveryModal()
      expect(modal.open).not.toHaveBeenCalled()
    )

    it "should activate the form if user dismisses prompt", inject(($uibModal, $q) ->
      spyOn($uibModal, "open").and.returnValue( {result: $q.reject()} )
      scope.recoveryModal()
      modalInstance.dismiss()
      scope.$digest()
      expect(scope.active).toEqual(true)
    )

  describe "password", ->

    it "should be valid if the password is ok", ->
      scope.form.password.$setViewValue('validpw')
      $timeout.flush()
      expect(scope.form.password.$valid).toEqual(true)

    it "should reset the confirmations field when changed", ->
      scope.form.confirmation.$setViewValue('conf')
      scope.form.password.$setViewValue('validpw')
      $timeout.flush()
      expect(scope.fields.confirmation).toEqual('')

    it "should not be valid if the password is too short", ->
      scope.form.password.$setViewValue('asd')
      $timeout.flush()
      expect(scope.form.password.$valid).toEqual(false)
      expect(scope.form.password.$error.minlength).toEqual(true)

    it "should not be valid if the password is the password hint", ->
      scope.form.password.$setViewValue('passhint')
      $timeout.flush()
      expect(scope.form.password.$valid).toEqual(false)
      expect(scope.form.password.$error.isValid).toEqual(true)

    it "should not be valid if the password is the main password", ->
      scope.form.password.$setViewValue('mainpw')
      $timeout.flush()
      expect(scope.form.password.$valid).toEqual(false)
      expect(scope.form.password.$error.isValid).toEqual(true)

    it "should not be valid if incorrect sec pass is entered when removing", ->
      scope.settings.secondPassword = 'secpass'
      scope.form.password.$setViewValue('not_secpass')
      $timeout.flush()
      expect(scope.form.password.$valid).toEqual(false)
      expect(scope.form.password.$error.isValid).toEqual(true)

  describe "confirmation", ->

    beforeEach ->
      scope.form.password.$setViewValue('validpw')
      $timeout.flush()

    it "should be valid if the confirmation is the same as the password", ->
      scope.form.confirmation.$setViewValue('validpw')
      expect(scope.form.confirmation.$valid).toEqual(true)

    it "should not be valid if the confirmation is different than the password", ->
      scope.form.confirmation.$setViewValue('differentpw')
      expect(scope.form.confirmation.$valid).toEqual(false)
      expect(scope.form.confirmation.$error.isValid).toEqual(true)
