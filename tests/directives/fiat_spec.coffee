describe "Fiat Directive", ->

  Wallet = undefined
  scope = undefined
  isoScope = undefined

  beforeEach module("walletApp")

  beforeEach ->
    inject ($rootScope, $compile, $injector) ->

      Wallet = $injector.get("Wallet")

      Wallet.settings = {
        currency: Wallet.currencies[0]
      }

      Wallet.conversions = {
        USD: { conversion: 1000, symbol: '$' }
        EUR: { conversion: 1500, symbol: 'e' }
      }

      scope = $rootScope.$new()
      scope.btc = 10000
      scope.currency = Wallet.currencies[0]

      template = '<fiat btc="btc"></fiat>'
      element = $compile(template)(scope)
      scope.$digest()

      isoScope = element.isolateScope()
      isoScope.$digest()

  describe "on load", ->

    it "should have access to wallet settings", ->
      expect(isoScope.settings).toEqual(Wallet.settings)

    it "should have access to wallet conversions", ->
      expect(isoScope.conversions).toEqual(Wallet.conversions)

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

    it "should watch the currency", ->
      isoScope.currency = Wallet.currencies[1]

  describe "updateFiat", ->

    describe "(fail)", ->

      beforeEach ->
        isoScope.fiat = { currencySymbol: '$', amount: 100 }

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

      it "should get fiat at time if a date is present", ->
        spyOn(Wallet, 'getFiatAtTime').and.returnValue({ then: (cb) -> cb(8) })
        isoScope.date = true
        isoScope.updateFiat()
        expect(Wallet.getFiatAtTime).toHaveBeenCalled()

      it "should not get fiat at time if a date is not present", ->
        spyOn(Wallet, 'convertFromSatoshi').and.returnValue(10)
        isoScope.updateFiat()
        expect(Wallet.convertFromSatoshi).toHaveBeenCalled()

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
