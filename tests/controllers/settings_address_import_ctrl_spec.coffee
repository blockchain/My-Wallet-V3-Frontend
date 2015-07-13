describe "AddressImportCtrl", ->
  scope = undefined
  Wallet = undefined

  modalInstance =
    close: ->
    dismiss: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller, $compile) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      scope = $rootScope.$new()

      $controller "AddressImportCtrl",
        $scope: scope,
        $stateParams: {},
        $modalInstance: modalInstance

      element = angular.element(
        '<form role="form" name="importForm" novalidate>' +
        '<input type="textarea" name="privateKey"       ng-model="fields.addressOrPrivateKey"   is-valid="isValidAddressOrPrivateKey(fields.addressOrPrivateKey)"     ng-disabled="BIP38"    ng-change="importForm.privateKey.$setValidity(\'present\', true)"   required />' +
        '<input type="password" name="bipPassphrase"    ng-model="fields.bip38passphrase"       ng-change="importForm.bipPassphrase.$setValidity(\'wrong\', true)"      ng-required="BIP38" />' +
        '</form>'
      )
      scope.model = { fields: {} }
      $compile(element)(scope)

      scope.$digest()

      return

    return

  it "should exist", ->
    expect(scope.close).toBeDefined()

  it "should have access to wallet accounts", inject((Wallet) ->
    expect(scope.accounts).toBe(Wallet.accounts)
  )

  describe "enter address or private key", ->

    it "should go to step 2 when user clicks validate", ->
      scope.fields.addressOrPrivateKey = "valid_import_address"
      expect(scope.step).toBe(1)
      scope.import()
      expect(scope.step).toBe(2)

  describe "validate and add", ->
    it "should add the address if no errors are present", ->
      scope.fields.addressOrPrivateKey = "valid_import_address"
      scope.import()
      expect(scope.address.address).toBe("valid_import_address")

    it "should show the balance", ->
      scope.fields.addressOrPrivateKey = "valid_import_address"
      scope.import()
      expect(scope.address.balance).not.toBe(0)

    it "should go to step 3 when user clicks transfer", ->
      scope.goToTransfer()
      expect(scope.step).toBe(3)

  describe "transfer", ->
    beforeEach ->
      scope.address = Wallet.legacyAddresses[0]

    it "should have access to accounts", ->
      expect(scope.accounts).toBeDefined()

    it "should show a spinner during sweep",  inject((Wallet) ->
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
