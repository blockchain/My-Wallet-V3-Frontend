describe "BuyCtrl", ->
  scope = undefined
  Wallet = undefined
  Alerts = undefined
  currency = undefined
  $rootScope = undefined
  $controller = undefined
  $q = undefined
  methods = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$controller_, _$q_) ->
      $rootScope = _$rootScope_
      $controller = _$controller_
      $q = _$q_

      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      Alerts = $injector.get("Alerts")
      currency = $injector.get("currency")
      buySell = $injector.get("buySell")

      methods = [{ inMedium: "card" }, { inMedium: "bank" }]

      buySell.getExchange = () ->
        {
          getPaymentMethods: () ->
            $q.resolve(methods)
          profile: {}
          user: {}
        }

      Wallet.settings.currency = { code: "USD" }
      Wallet.changeCurrency = () -> $q.resolve()

      MyWallet.wallet = {}
      MyWallet.wallet.accountInfo = {}
      MyWallet.wallet.hdwallet = 
        accounts: [{ label: 'My Bitcoin Wallet'}, {label: 'New Wallet'}]
        defaultAccount: {index: 0}

      currency.conversions = { "USD": "$", "EUR": "E", "GBP": "P" }
      currency.formatCurrencyForView = (amt, curr) -> "#{curr.code}(#{amt})"

  getControllerScope = (params = {}) ->
    scope = $rootScope.$new()
    $controller "BuyCtrl",
      $scope: scope,
      $uibModalInstance: params.modalInstance ? { close: (->) dismiss: (->) }
      fiat: params.fiat ? 0
      trade: params.trade ? false
      bitcoinReceived: params.bitcoinReceived ? false
      kyc: params.kyc ? false
    scope

  beforeEach ->
    scope = getControllerScope()
    $rootScope.$digest()

  describe "label", ->
    it "should use the default label if no trade exists", ->
      scope.trade = undefined
      expect(scope.label).toBe('My Bitcoin Wallet')

  describe "getPaymentMethods", ->
    beforeEach ->
      spyOn(scope.exchange, "getPaymentMethods").and.callThrough()

    it "should set the correct scope variables from the response", ->
      expect(scope.method).toEqual('card')

      scope.getPaymentMethods()
      expect(scope.exchange.getPaymentMethods).toHaveBeenCalled()

      expect(scope.methods.card).toEqual(methods[0])
      expect(scope.methods.bank).toEqual(methods[1])

  describe "changeCurrency", ->
    beforeEach ->
      spyOn(Wallet, "changeCurrency").and.callThrough()

    it "should default to the users currency setting", ->
      scope.changeCurrency()
      expect(scope.currencySymbol).toEqual("$")

    it "should use the currency argument if passed", ->
      scope.changeCurrency({ code: "EUR" })
      expect(scope.currencySymbol).toEqual("E")

    it "should use the trade currency if trade exists", ->
      scope.trade = { inCurrency: "GBP" }
      scope.changeCurrency()
      expect(scope.currencySymbol).toEqual("P")

    it "should set the transaction currency and refresh payment methods data", ->
      spyOn(scope, "getPaymentMethods")
      scope.changeCurrency()
      $rootScope.$digest()
      expect(scope.transaction.currency.code).toEqual("USD")
      expect(scope.getPaymentMethods).toHaveBeenCalled()

  describe "updateAmounts", ->
    beforeEach ->
      spyOn(currency, "formatCurrencyForView").and.callThrough()

    it "should not do anything without a user or exchange", ->
      scope.quote = scope.exchange.user = null
      scope.updateAmounts()
      expect(currency.formatCurrencyForView).not.toHaveBeenCalled()

    it "should update with the correct values", ->
      scope.exchange.user = {}
      scope.quote = quoteAmount: 105
      scope.transaction.fiat = 100
      scope.methods.card = inPercentageFee: 5
      scope.updateAmounts()
      expect(scope.transaction).toEqual(jasmine.objectContaining({fiat: 100, methodFee: "5.00"}))

  describe "nextStep", ->
    beforeEach ->
      scope.exchange.user = undefined
      scope.user.isEmailVerified = false
      scope.user.email = "a@b.com"
      scope.$digest()


    it "should switch to amount step", ->
      scope.nextStep()
      expect(scope.onStep('amount')).toEqual(true)

    it "should switch to select-country step", ->
      scope.transaction.fiat = 1
      scope.nextStep()
      expect(scope.onStep('select-country')).toEqual(true)

    it "should switch to email step", ->
      scope.transaction.fiat = 1
      scope.fields.countryCode = 'GB'
      scope.nextStep()
      scope.nextStep()
      expect(scope.onStep('email')).toEqual(true)

    it "shuold switch to accept-terms step", ->
      scope.transaction.fiat = 1
      scope.user.isEmailVerified = true
      scope.fields.countryCode = 'GB'
      scope.nextStep()
      scope.nextStep()
      expect(scope.onStep('accept-terms')).toEqual(true)

    it "should switch to select-payment-method step", ->
      scope.transaction.fiat = 1
      scope.exchange.user = {}
      scope.nextStep()
      scope.nextStep()
      expect(scope.onStep('select-payment-method')).toEqual(true)

    it "should switch to summary step", ->
      scope.transaction.fiat = 1
      scope.exchange.user = {}
      scope.isMethodSelected = true
      scope.nextStep()
      scope.nextStep()
      expect(scope.onStep('summary')).toEqual(true)

    it "should switch to trade-formatted step", ->
      scope.transaction.fiat = 1
      scope.exchange.user = {}
      scope.trade = {}
      scope.nextStep()
      scope.nextStep()
      expect(scope.onStep('trade-formatted')).toEqual(true)

    it "should switch to trade-complete step", ->
      scope.transaction.fiat = 1
      scope.exchange.user = {}
      scope.trade = {}
      scope.paymentInfo = {}
      scope.nextStep()
      scope.nextStep()
      expect(scope.onStep('trade-complete')).toEqual(true)

    it "should switch to pending step", ->
      scope.transaction.fiat = 1
      scope.exchange.user = {}
      scope.trade = {}
      scope.formattedTrade = {}
      scope.nextStep()
      scope.nextStep()
      expect(scope.onStep('pending')).toEqual(true)

    it "should switch to success step", ->
      scope.transaction.fiat = 1
      scope.exchange.user = {}
      scope.trade = {}
      scope.formattedTrade = {}
      scope.bitcoinReceived = true
      scope.nextStep()
      scope.nextStep()
      expect(scope.onStep('success')).toEqual(true)

  describe "standardError", ->
    it "should reject an email already that has an acct", ->
      err = '{"error":"email_address_in_use","error_description":"A user already exists with the given email address."}'
      scope.standardError(err)
      expect(scope.rejectedEmail).toEqual(true)

  describe "hideQuote", ->
    it "should hide the quote", ->
      scope.goTo('pending')
      expect(scope.hideQuote()).toBe(true)

  describe "prevStep", ->
    it "should go back one step", ->
      scope.exchange.user = undefined
      scope.step = 2
      scope.prevStep()
      expect(scope.step).toBe(1)
    
    it "should go to a specific step", ->
      scope.goTo('summary')
      scope.exchange.user = true
      scope.prevStep()
      expect(scope.step).toBe(4)

  describe "close", ->
    beforeEach ->
      spyOn(Alerts, 'confirm').and.callThrough()

    it "should confirm when leaving amount selection", ->
      scope.goTo('amount')
      scope.close()
      expect(Alerts.confirm).toHaveBeenCalledWith('CONFIRM_CLOSE_AMT', {action: 'CLOSE'})

    it "should confirm close when acct is true", ->
      scope.goTo('select-country')
      scope.close(true)
      expect(Alerts.confirm).toHaveBeenCalledWith('CONFIRM_CLOSE', {action: 'IM_DONE'})

    it "should confirm close account otherwise", ->
      scope.goTo('select-country')
      scope.close()
      expect(Alerts.confirm).toHaveBeenCalledWith('CONFIRM_CLOSE_ACCT', {action: 'IM_DONE'})
