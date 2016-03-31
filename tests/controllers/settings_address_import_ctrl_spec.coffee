describe "AddressImportCtrl", ->
  scope = undefined
  Wallet = undefined

  accounts = [{index: 0, label: "Spending", archived: false}]

  modalInstance =
    close: ->
    dismiss: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller, $compile, $templateCache) ->
      Wallet = $injector.get("Wallet")

      Wallet.addAddressOrPrivateKey = (addressOrPrivateKey, bip38passphrase, success, error, cancel) ->
        if addressOrPrivateKey
          success({address: "valid_import_address"})
        else
          error('presentInWallet')
          error('wrongBipPass')
          error('importError')

      Wallet.accounts = () -> accounts

      Wallet.my =
        wallet:
          keys: []
          hdwallet:
            defaultAccountIndex: 0

      Wallet.status = {
        isLoggedIn: true
      }

      scope = $rootScope.$new()
      template = $templateCache.get('partials/settings/import-address.jade')

      $controller "AddressImportCtrl",
        $scope: scope,
        $stateParams: {},
        $uibModalInstance: modalInstance
        address: null

      scope.model = { fields: {} }
      $compile(template)(scope)

      scope.$digest()

      return

    return

  it "should exist", ->
    expect(scope.close).toBeDefined()

  it "should have access to wallet accounts", inject((Wallet) ->
    expect(scope.accounts()).toEqual(Wallet.accounts())
  )

  describe "enter address or private key", ->

    it "should go to step 2 when user clicks validate", inject(($timeout) ->
      scope.fields.addressOrPrivateKey = "valid_import_address"
      expect(scope.step).toBe(1)
      scope.import()
      $timeout.flush()
      expect(scope.step).toBe(2)
    )

  describe "validate and add", ->
    it "should add the address if no errors are present", inject(($timeout) ->
      scope.fields.addressOrPrivateKey = "valid_import_address"
      scope.import()
      $timeout.flush()
      expect(scope.address.address).toBe("valid_import_address")
    )

    it "should show the balance", inject(($timeout) ->
      scope.fields.addressOrPrivateKey = "valid_import_address"
      scope.import()
      $timeout.flush()
      expect(scope.address.balance).not.toBe(0)
    )

    describe "error", ->

      beforeEach ->
        scope.success = () ->
        scope.cancel = () ->
        scope.error = () ->

      it "should handle an error", inject(($timeout) ->
        spyOn(scope, "error")
        scope.import()
        $timeout.flush()
        Wallet.addAddressOrPrivateKey('', false, scope.success, scope.error, scope.cancel);
        expect(scope.error).toHaveBeenCalled()
      )

      it "should set validity based on error message", ->
        scope.error = (error) -> error
        Wallet.addAddressOrPrivateKey('presentInWallet', false, scope.success, scope.error, scope.cancel);
        expect(scope.importForm.privateKey.$valid).toBe(false)


    it "should go to step 3 when user clicks transfer", ->
      scope.goToTransfer()
      expect(scope.step).toBe(3)

  describe "transfer", ->
    beforeEach ->
      scope.address = Wallet.legacyAddresses()[0]

    it "should have access to accounts", ->
      expect(scope.accounts()).toBeDefined()

    it "should show a spinner during sweep",  inject((Wallet) ->
      pending()
      spyOn(Wallet, "transaction").and.callFake((success, error) ->
        expect(scope.status.sweeping).toBe(true)
        {
          sweep: () ->
            success()
        }
      )

      expect(scope.status.sweeping).toBe(false)

      scope.transfer()

      # This is called after success:
      expect(scope.status.sweeping).toBe(false)

    )

  describe "parseBitcoinUrl()", ->
    it "should work with prefix", ->
      expect(scope.parseBitcoinUrl("1GjW7vwRUcz5YAtF625TGg2PsCAM8fRPEd")).toBe("1GjW7vwRUcz5YAtF625TGg2PsCAM8fRPEd")

    it "should work without slashes", ->
      expect(scope.parseBitcoinUrl("bitcoin:1GjW7vwRUcz5YAtF625TGg2PsCAM8fRPEd")).toBe("1GjW7vwRUcz5YAtF625TGg2PsCAM8fRPEd")

    it "should work with slashes", ->
      expect(scope.parseBitcoinUrl("bitcoin://1GjW7vwRUcz5YAtF625TGg2PsCAM8fRPEd")).toBe("1GjW7vwRUcz5YAtF625TGg2PsCAM8fRPEd")
