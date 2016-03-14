describe "RequestCtrl", ->

  scope = undefined
  modalInstance =
    close: ->
    dismiss: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $controller, $rootScope, $compile) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      currency = $injector.get('currency')

      MyWallet.wallet = {
        isUpgradedToHD: true
        keys: [
          { address: '1asdf', archived: false }, { address: '1asdf', archived: true }
        ]
        hdwallet: {
          accounts: [{ index: 0, archived: true }, { index: 0, archived: false }, { index: 0, archived: true }]
          defaultAccountIndex: 0
        }

      }

      Wallet.settings = {
        currency: currency.currencies[0]
        btcCurrency: currency.bitCurrencies[0]
      }

      Wallet.status = {
        didInitializeHD: true
        isLoggedIn: true
      }

      currency.conversions.EUR = { conversion: 400000 }

      scope = $rootScope.$new()

      $controller "RequestCtrl",
        $scope: scope,
        $stateParams: {},
        $uibModalInstance: modalInstance,
        destination: undefined,
        focus: false,
        hasLegacyAddress: false


      element = angular.element(
        '<form role="form" name="requestForm" novalidate>' +
        '<input type="text" name="amount"   ng-model="fields.amount"  currency="{{fields.currency}}" />' +
        '</form>'
      )
      scope.model = { fields: {to: null, amount: '0', currency: Wallet.settings.currency, label: ""} }
      $compile(element)(scope)

      scope.$digest()

      scope.fields.amount = '1'
      scope.$apply()

      return

    return

  describe "destinations", ->
    it "should include accounts",  ->
      expect(scope.destinations.length).toBeGreaterThan(0)
      expect(scope.destinations[0].index).toBeDefined()

    it "should not include archived accounts",  inject((Wallet) ->
      # Make sure there's an archived account in the mocks:
      match = false
      for account in scope.accounts()
        match = true if account.archived

      expect(match).toBe(true, "Archived account missing in mocks")

      # Test that this archived account is not included in origins:
      for destination in scope.destinations
        expect(destination.archived).toBe(false, "Archived account in destinations")
    )

  describe "when requesting for a legacy address", ->

    it "should select the users currency by default", inject((Wallet)->
      expect(scope.settings.currency.code).toBe("USD")
    )

    it "should have a bit currency", inject((Wallet)->
      expect(scope.settings.btcCurrency).toBeDefined()
    )

    it "should have access to legacy addresses",  inject(() ->
      expect(scope.legacyAddresses).toBeDefined()
      expect(scope.legacyAddresses().length).toBeGreaterThan(0)
    )

    it "should combine accounts and active legacy addresses in destinations", ->
      expect(scope.destinations).toBeDefined()

      foundAccount = false
      foundLegacyAddress = false

      for destination in scope.destinations
        foundAccount = true if destination.index?
        foundLegacyAddress = true if !destination.index?

      expect(foundAccount).toBe(true)
      expect(foundLegacyAddress).toBe(true)

    it "should close", inject((Alerts) ->
      spyOn(Alerts, "clear")
      scope.done()
      expect(Alerts.clear).toHaveBeenCalled()
    )

    it "should show a payment request address when legacy address is selected", inject(()->
      scope.fields.to = scope.legacyAddresses()[0]
      scope.$digest()
      expect(scope.paymentRequestAddress()).toBe(scope.fields.to.address)
    )

    it "should show a payment URL when legacy address is selected", ->
      scope.fields.to = scope.legacyAddresses()[0]
      scope.$digest()
      expect(scope.paymentRequestURL()).toBeDefined()
      expect(scope.paymentRequestURL()).toContain("bitcoin:")


    it "should show a payment URL with amount when legacy address is selected and amount > 0", ->
      scope.fields.to = scope.legacyAddresses()[0]
      scope.fields.amount = 10000000
      scope.$digest()
      expect(scope.paymentRequestURL()).toBeDefined()
      expect(scope.paymentRequestURL()).toContain("amount=0.1")

    it "should not have amount argument in URL if amount is zero, null or empty", ->
      scope.fields.to = scope.legacyAddresses()[0]
      scope.fields.amount = "0"
      scope.$digest()
      expect(scope.paymentRequestURL()).toBeDefined()
      expect(scope.paymentRequestURL()).not.toContain("amount=")

      scope.fields.amount = null
      scope.$digest()
      expect(scope.paymentRequestURL()).not.toContain("amount=")

      scope.fields.amount = ""
      scope.$digest()
      expect(scope.paymentRequestURL()).not.toContain("amount=")
