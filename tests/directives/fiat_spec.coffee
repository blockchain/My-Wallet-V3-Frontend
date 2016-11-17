describe "Fiat Directive", ->

  Wallet = undefined
  scope = undefined
  isoScope = undefined

  beforeEach module('walletDirectives');
  beforeEach module("walletApp")

  beforeEach ->
    inject ($rootScope, $compile, $injector) ->

      Wallet = $injector.get("Wallet")
      currency = $injector.get('currency')

      Wallet.settings = {
        currency: currency.currencies[0]
      }

      currency.conversions.USD = { conversion: 1000, symbol: '$' }
      currency.conversions.EUR = { conversion: 1500, symbol: 'e' }

      scope = $rootScope.$new()
      scope.btc = 10000
      scope.currency = currency.currencies[0]

      template = '<fiat btc="btc"></fiat>'
      element = $compile(template)(scope)
      scope.$digest()

      isoScope = element.isolateScope()
      isoScope.$digest()

  describe "on load", ->

    it "should have access to wallet settings", ->
      expect(isoScope.settings).toEqual(Wallet.settings)

    it "should have access to currency conversions", inject((currency) ->
      expect(isoScope.conversions).toEqual(currency.conversions)
    )

  describe "watchers", ->

    beforeEach ->
      spyOn(isoScope, 'updateFiat')
      expect(isoScope.updateFiat).not.toHaveBeenCalled()

    afterEach ->
      isoScope.$digest()
      expect(isoScope.updateFiat).toHaveBeenCalled()

    it "should watch the conversions collection", ->
      isoScope.conversions = 'changed_conversions'

    it "should watch the wallet settings currency", ->
      isoScope.settings.currency.code = 'TEST'

    it "should watch the btc amount", ->
      isoScope.btc = 20000

    it "should watch the currency", inject((currency) ->
      isoScope.currency = currency.currencies[1]
    )

  describe "updateFiat", ->
    beforeEach ->
      isoScope.fiat = { currencySymbol: '$', amount: 100 }
      isoScope.$root = {
        # Travis sometimes breaks with the real thing.
        $safeApply: () ->
      }

    describe "(fail)", ->

      afterEach ->
        isoScope.updateFiat()
        expect(isoScope.fiat).toEqual({ currencySymbol: null, amount: null })

      it "should return if there is no btc value", ->
        isoScope.btc = undefined

      it "should return if no fiat currency is available", ->
        isoScope.currency = isoScope.settings.currency = undefined

      it "should return if there is no conversion available", ->
        isoScope.conversions['USD'] = undefined

      it "should return if the conversion is not greater than 0", ->
        isoScope.conversions['USD'] = { conversion: -123 }

    describe "(success)", ->

      it "should set the symbol correctly", ->
        isoScope.updateFiat()
        expect(isoScope.fiat.currencySymbol).toEqual('$')

      it "should set the amount correctly", ->
        isoScope.updateFiat()
        expect(isoScope.fiat.amount).toEqual('10.00')

      it "should set the amount correctly when btc is 0", ->
        isoScope.btc = 0
        isoScope.updateFiat()
        expect(isoScope.fiat.amount).toEqual('0.00')

      it "should get fiat at time if a date is present", inject((currency) ->
        spyOn(currency, 'getFiatAtTime').and.returnValue({ then: (cb) -> cb(8) })
        isoScope.date = true
        isoScope.updateFiat()
        expect(currency.getFiatAtTime).toHaveBeenCalled()
      )

      it "should not get fiat at time if a date is not present", inject((currency) ->
        spyOn(currency, 'convertFromSatoshi').and.returnValue(10)
        isoScope.updateFiat()
        expect(currency.convertFromSatoshi).toHaveBeenCalled()
      )

      it "should not set the absolute value if not needed", ->
        isoScope.btc = -10000
        isoScope.updateFiat()
        expect(isoScope.fiat.amount).toEqual('-10.00')

      it "should set the absolute value if needed", inject(($compile) ->
        isoScope = $compile('<fiat btc="btc" abs></fiat>')(scope).isolateScope()
        isoScope.btc = -10000
        isoScope.updateFiat()
        expect(isoScope.fiat.amount).toEqual('10.00')
      )
