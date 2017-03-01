describe "RequestCtrl", ->

  scope = undefined
  modalInstance =
    close: ->
    dismiss: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $controller, $rootScope, $compile, $templateCache) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      currency = $injector.get('currency')
      smartAccount = $injector.get("smartAccount")

      MyWallet.wallet = {
        isUpgradedToHD: true
        keys: [
          { address: '1asdf', archived: false, isWatchOnly: false }, { address: '1asdf', archived: true }
        ]
        hdwallet: {
          accounts: [{ index: 0, archived: true },
                     { index: 1, archived: false },
                     { index: 2, archived: true },
                     { label: "Checking", index: 3, archived: false, balance: 100 }]
          defaultAccountIndex: 0
          defaultAccount: { label: "Checking", index: 3, archived: false, balance: 100 }
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
      template = $templateCache.get('partials/request.pug')

      $controller "RequestCtrl",
        $scope: scope,
        $stateParams: {},
        $uibModalInstance: modalInstance,
        destination: undefined,
        focus: false,
        hasLegacyAddress: true

      scope.model = { fields: {to: null, amount: '0', currency: Wallet.settings.currency, label: ""} }
      $compile(template)(scope)

      scope.$digest()

      scope.fields.amount = '1'
      scope.$apply()

      return

    return

  it "should toggle between advanced (customize) and regular receive", ->
    scope.advancedReceive()
    expect(scope.advanced).toBe(true)
    scope.regularReceive()
    expect(scope.advanced).toBe(false)

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

    describe "showPaymentRequestURL", ->
      it "should be set as false initially", ->
        expect(scope.showPaymentRequestURL).toBe(false);

    describe "paymentRequestURL", ->

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

      it "should generate a valid bitcoin url", ->
        scope.fields.to = scope.legacyAddresses()[0]
        scope.fields.amount = 10000000
        scope.fields.label = "Label Label Label"
        scope.$digest()

        expect(scope.paymentRequestURL()).toBe('bitcoin:1asdf?amount=0.1&message=Label%20Label%20Label')

      it "should generate a valid bitcoin url with only an amount and address", ->
        scope.fields.to = scope.legacyAddresses()[0]
        scope.fields.amount = 10000000
        scope.$digest()

        expect(scope.paymentRequestURL()).not.toContain('&')
        expect(scope.paymentRequestURL()).toBe('bitcoin:1asdf?amount=0.1')

      it "should generate a valid bitcoin url with only a label and address", ->
        scope.fields.to = scope.legacyAddresses()[0]
        scope.fields.label = "Label Label Label"
        scope.fields.amount = 0
        scope.$digest()

        expect(scope.paymentRequestURL()).not.toContain('&')
        expect(scope.paymentRequestURL()).toBe("bitcoin:1asdf?message=Label%20Label%20Label")

      it "should generate a bitcoin url with a message param instead of a label", ->
        scope.fields.to = scope.legacyAddresses()[0]
        scope.fields.label = "This is a message, though we save it as a label"
        scope.$digest()

        expect(scope.paymentRequestURL()).toContain('message')
        expect(scope.paymentRequestURL()).not.toContain('label=')
