describe "BuyCtrl", ->
  scope = undefined
  Wallet = undefined
  Alerts = undefined
  currency = undefined
  $rootScope = undefined
  $controller = undefined
  $q = undefined

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

      Wallet.settings.currency = { code: "USD" }
      Wallet.changeCurrency = () -> $q.resolve()

      MyWallet.wallet = {}
      MyWallet.wallet.accountInfo = {}
      MyWallet.wallet.hdwallet = { accounts: [{ label: 'My Bitcoin Wallet '}] }

      MyWallet.wallet.external =
        coinify:
          getPaymentMethods: ->
          profile: {}

      currency.conversions = { "USD": "$", "EUR": "E", "GBP": "P" }
      currency.formatCurrencyForView = (amt, curr) -> "#{curr.code}(#{amt})"

  getControllerScope = (params = {}) ->
    scope = $rootScope.$new()
    $controller "BuyCtrl",
      $scope: scope,
      $uibModalInstance: params.modalInstance ? { close: (->) dismiss: (->) }
      exchange: params.exchange ? {}
      trades: params.trades ? []
      fiat: params.fiat ? 0
      trade: params.trade ? false
      bitcoinReceived: params.bitcoinReceived ? false
    scope

  describe "getPaymentMethods", ->
    methods = [{ inMedium: "card" }, { inMedium: "bank" }]
    beforeEach ->
      scope = getControllerScope()
      scope.exchange.user = {}
      spyOn(Wallet, "changeCurrency").and.callThrough()
      spyOn(scope.exchange, "getPaymentMethods").and.returnValue($q.resolve(methods))

    it "should set the correct scope variables from the response", ->
      expect(scope.method).toEqual('card')
      scope.getPaymentMethods()
      $rootScope.$digest()
      expect(scope.exchange.getPaymentMethods).toHaveBeenCalled()
      expect(scope.methods.card).toEqual(methods[0])
      expect(scope.methods.bank).toEqual(methods[1])

  describe "changeCurrency", ->
    beforeEach ->
      scope = getControllerScope()
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
      scope = getControllerScope()
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
      expect(scope.transaction).toEqual(jasmine.objectContaining({fiat: 100, btc: "BTC(105)", methodFee: "5.00"}))

  describe "nextStep", ->
    it "should switch to amount step", ->
      scope = getControllerScope()
      scope.nextStep()
      expect(scope.onStep('amount')).toEqual(true)

    it "should switch to select-country step", ->
      scope.transaction.fiat = 1
      scope.nextStep()
      expect(scope.onStep('select-country')).toEqual(true)

    it "should switch to email step", ->
      scope.fields.countryCode = 'GB'
      scope.nextStep()
      expect(scope.onStep('email')).toEqual(true)

    it "shuold switch to accept-terms step", ->
      scope.user.isEmailVerified = true
      scope.nextStep()
      expect(scope.onStep('accept-terms')).toEqual(true)

    it "should switch to summary step", ->
      scope.exchange.user = {}
      scope.nextStep()
      expect(scope.onStep('summary')).toEqual(true)

    it "should switch to trade-formatted step", ->
      scope.trade = {}
      scope.nextStep()
      expect(scope.onStep('trade-formatted')).toEqual(true)

    it "should switch to trade-complete step", ->
      scope.paymentInfo = {}
      scope.nextStep()
      expect(scope.onStep('trade-complete')).toEqual(true)

    it "should switch to pending step", ->
      scope.formattedTrade = {}
      scope.nextStep()
      expect(scope.onStep('pending')).toEqual(true)

    it "should switch to success step", ->
      scope.bitcoinReceived = true
      scope.nextStep()
      expect(scope.onStep('success')).toEqual(true)

  describe "close", ->
    beforeEach ->
      spyOn(Alerts, 'confirm').and.callThrough()
      scope = getControllerScope()

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
