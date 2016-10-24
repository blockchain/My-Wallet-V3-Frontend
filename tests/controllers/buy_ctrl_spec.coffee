describe "BuyCtrl", ->
  scope = undefined
  Wallet = undefined
  Alerts = undefined
  currency = undefined
  $rootScope = undefined
  $controller = undefined
  $q = undefined
  $timeout = undefined
  mediums = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$controller_, _$q_, _$timeout_) ->
      $rootScope = _$rootScope_
      $controller = _$controller_
      $q = _$q_
      $timeout = _$timeout_

      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      Alerts = $injector.get("Alerts")
      currency = $injector.get("currency")
      buySell = $injector.get("buySell")

      mediums = [{ inMedium: "card" }, { inMedium: "bank" }]

      buySell.getExchange = () ->
        profile: {}
        user: {}

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
      trade: params.trade ? false
      buyOptions: params.buyOptions ? {}
    scope

  beforeEach ->
    scope = getControllerScope()
    $rootScope.$digest()

  describe "label", ->
    it "should use the default label if no trade exists", ->
      scope.trade = undefined
      expect(scope.label).toBe('My Bitcoin Wallet')

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

    it "should set the transaction currency and refresh payment mediums data", ->
      scope.changeCurrency()
      $rootScope.$digest()
      expect(scope.transaction.currency.code).toEqual("USD")

  describe "updateAmounts", ->
    beforeEach ->
      spyOn(currency, "formatCurrencyForView").and.callThrough()

    it "should not do anything without a user or exchange", ->
      scope.quote = scope.exchange.user = null
      scope.updateAmounts()
      expect(currency.formatCurrencyForView).not.toHaveBeenCalled()

    it "should update with the correct values", ->
      scope.exchange.user = {}
      scope.medium = 'card'
      scope.quote =
        quoteAmount: 10000 # $100.00
        id: 1
        paymentMediums:
          card:
            fee: 501
            total: 10501
      scope.transaction.fiat = 100
      scope.updateAmounts()
      expect(scope.transaction.methodFee).toEqual('5.01')
      expect(scope.transaction.total).toEqual('105.01')

  describe "nextStep", ->
    beforeEach ->
      scope.exchange.user = undefined
      scope.user.isEmailVerified = false
      scope.isMediumSelected = false
      scope.user.email = "a@b.com"
      scope.$digest()

    it "should switch to select-country step", ->
      expect(scope.onStep('select-country')).toEqual(true)

    it "should switch to email step", ->
      scope.fields.countryCode = 'GB'
      scope.nextStep()
      expect(scope.onStep('email')).toEqual(true)

    it "shuold switch to accept-terms step", ->
      scope.transaction.fiat = 1
      scope.user.isEmailVerified = true
      scope.fields.countryCode = 'GB'
      scope.nextStep()
      scope.nextStep()
      expect(scope.onStep('accept-terms')).toEqual(true)

    it "should switch to select-payment-medium step", ->
      scope.transaction.fiat = 1
      scope.exchange.user = {}
      scope.nextStep()
      expect(scope.onStep('select-payment-medium')).toEqual(true)

    it "should switch to isx step", ->
      scope.transaction.fiat = 1
      scope.exchange.user = {}
      scope.trade = {state: 'pending'}
      scope.nextStep()
      scope.nextStep()
      expect(scope.onStep('isx')).toEqual(true)

    it "should switch to trade-formatted step", ->
      scope.transaction.fiat = 1
      scope.exchange.user = {}
      scope.isMediumSelected = true
      scope.trade = {state: 'completed'}
      scope.formattedTrade = 'finished trade'
      scope.nextStep()
      scope.nextStep()
      expect(scope.onStep('trade-formatted')).toEqual(true)

  describe "standardError", ->
    it "should reject an email already that has an acct", ->
      err = '{"error":"email_address_in_use","error_description":"A user already exists with the given email address."}'
      scope.standardError(err)
      expect(scope.rejectedEmail).toEqual(true)

  describe "hideQuote", ->
    it "should hide the quote", ->
      scope.goTo('trade-formatted')
      expect(scope.hideQuote()).toBe(true)

  describe "prevStep", ->
    it "should go back one step", ->
      scope.exchange.user = undefined
      scope.step = 1
      scope.prevStep()
      expect(scope.step).toBe(0)

    it "should go to a specific step", ->
      scope.goTo('summary')
      scope.exchange.user = true
      scope.prevStep()
      expect(scope.step).toBe(3)

  describe "close", ->
    beforeEach ->
      spyOn(Alerts, 'confirm').and.callThrough()

    it "should confirm close when acct is true", ->
      scope.goTo('select-country')
      scope.close(true)
      expect(Alerts.confirm).toHaveBeenCalledWith('CONFIRM_CLOSE', {action: 'IM_DONE'})

    it "should confirm close account otherwise", ->
      scope.goTo('select-country')
      scope.close()
      expect(Alerts.confirm).toHaveBeenCalledWith('CONFIRM_CLOSE_ACCT', {action: 'IM_DONE'})
