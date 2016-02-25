describe "SettingsImportedAddressesCtrl", ->
  scope = undefined
  Wallet = undefined

  modal =
    open: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      Alerts = $injector.get("Alerts")

      Alerts.confirm = () ->
        then: (f) -> f(true)

      legacyAddresses = [{archived: false},{archived: true}]

      Wallet.legacyAddresses = () ->
        legacyAddresses

      Wallet.my =
        wallet:
          deleteLegacyAddress: () ->
            legacyAddresses.pop()
          keys: legacyAddresses

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
      address = scope.legacyAddresses()[1]
      before = scope.legacyAddresses().length

      spyOn(Wallet, "deleteLegacyAddress").and.callThrough()

      scope.delete(address)
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
