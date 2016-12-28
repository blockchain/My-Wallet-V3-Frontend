describe "RecoveryBeforeSecondPasswordCtrl", ->
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

      $controller "RecoveryBeforeSecondPasswordCtrl",
        $scope: scope,
        $uibModalInstance: modalInstance,
        $uibModal: modal

  describe "start backup phrase process", ->
    it "should open", ->
      spyOn(modal, "open")
      scope.openRecoveryModal()
      expect(modal.open).toHaveBeenCalled()

    it "should close the first modal", ->
      spyOn(modalInstance, "close")
      scope.openRecoveryModal()
      expect(modalInstance.close).toHaveBeenCalled()

