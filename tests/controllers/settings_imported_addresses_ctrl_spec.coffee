describe "SettingsImportedAddressesCtrl", ->
  scope = undefined
  Wallet = undefined
  mockModalInstance = undefined

  modal =
    open: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")

      legacyAddresses = [{archived: false},{archived: true}]

      Wallet.legacyAddresses = () ->
        legacyAddresses

      Wallet.my =
        wallet:
          deleteLegacyAddress: () ->
            legacyAddresses.pop()
          keys: legacyAddresses

      mockModalInstance =
        result: then: (confirmCallback, cancelCallback) ->
          #Store the callbacks for later when the user clicks on the OK or Cancel button of the dialog
          @confirmCallBack = confirmCallback
          @cancelCallback = cancelCallback
          return
        close: (item) ->
          #The user clicked OK on the modal dialog, call the stored confirm callback with the selected item
          @result.confirmCallBack item
          return
        dismiss: (type) ->
          #The user clicked cancel on the modal dialog, call the stored cancel callback
          @result.cancelCallback type
          return

      scope = $rootScope.$new()

      $controller "SettingsImportedAddressesCtrl",
        $scope: scope,
        $stateParams: {}
        $uibModal: modal
        Wallet: Wallet

      return

    return

  describe "legacy addresses", ->
    it "can be unarchived", ->
      address = scope.legacyAddresses()[1]
      expect(address.archived).toBe(true)
      scope.unarchive(address)
      expect(address.archived).toBe(false)

    it "can be deleted", inject((Wallet, $uibModal) ->
      spyOn($uibModal, 'open').and.returnValue(mockModalInstance)
      address = scope.legacyAddresses()[1]
      before = scope.legacyAddresses().length

      spyOn(Wallet, "deleteLegacyAddress").and.callThrough()

      scope.delete(address)
      scope.deleteModal.close();
      expect(Wallet.deleteLegacyAddress).toHaveBeenCalled()

      expect(scope.legacyAddresses().length).toBe(before - 1)
    )

  describe "importAddress()", ->
    it "should open a modal",  inject(($uibModal) ->
      spyOn(modal, "open")
      scope.importAddress()
      expect(modal.open).toHaveBeenCalled()
    )

  describe "toggling archived addresses", ->
    it "should toggle archived address", ->
      spyOn(scope, "toggleDisplayArchived").and.callThrough()
      scope.toggleDisplayArchived()
      expect(scope.toggleDisplayArchived).toHaveBeenCalled()
      expect(scope.display.archived).toBe(true)
