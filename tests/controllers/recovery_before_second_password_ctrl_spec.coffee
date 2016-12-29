describe "RecoveryBeforeSecondPasswordCtrl", ->
	Wallet = undefined
	scope = undefined
	modal =
		open: ->
	modalInstance =
    close: ->
    dismiss: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller, $compile, $templateCache) ->
      scope = $rootScope.$new()
      template = $templateCache.get("partials/recovery-before-second-password.jade")
      Wallet = $injector.get("Wallet")

      $controller "RecoveryBeforeSecondPasswordCtrl",
        $scope: scope,
        $uibModalInstance: modalInstance,
        $uibModal: modal,
        Wallet: Wallet

  describe "start backup phrase process", ->
    it "should open", ->
      spyOn(modal, "open")
      scope.openRecoveryModal()
      expect(modal.open).toHaveBeenCalled()

    it "should close the first modal", ->
      spyOn(modalInstance, "close")
      scope.openRecoveryModal()
      expect(modalInstance.close).toHaveBeenCalled()

  describe "dismiss recovery option", ->
    it "should close the modal", ->
      spyOn(modalInstance, "close")
      scope.setSecondPasswordAnyway()
      expect(modalInstance.close).toHaveBeenCalled()

    it "should call the wallet service", ->
      spyOn(Wallet, "dismissedRecoveryPrompt")
      scope.setSecondPasswordAnyway()
      expect(Wallet.dismissedRecoveryPrompt).toHaveBeenCalled()