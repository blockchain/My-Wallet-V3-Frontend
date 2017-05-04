describe "CoinifySellController", ->
  $rootScope = undefined
  $controller = undefined
  options = undefined
  buySell = undefined
  buySellOptions = undefined
  $scope = undefined
  accounts = undefined
  bankMedium = undefined
  payment = undefined
  trade = undefined
  exchange = undefined
  user = undefined

  quote = {
    quoteAmount: 1
    baseAmount: -100
    baseCurrency: 'EUR'
    expiresAt: 100000000
    getPayoutMediums: () -> $q.resolve()
  }

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $q, _$rootScope_, _$controller_) ->
      $rootScope = _$rootScope_
      $controller = _$controller_
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      currency = $injector.get("currency")
      buySell = $injector.get("buySell")
      MyWalletPayment = $injector.get("MyWalletPayment")
      MyWalletHelpers = $injector.get("MyWalletHelpers")

      options = {
        partners: {
          coinify: {}
        }
      }

      accounts = [{id: 123}, {id: 456}]
      trade = {
        quote: {
          quoteCurrency: 'EUR'
          quoteAmount: 1
          baseAmount: -100
          baseCurrency: 'EUR'
          expiresAt: 100000000
          getPayoutMediums: () -> $q.resolve()
        }
      }

      MyWallet.wallet = {
        hdwallet: {
          defaultAccount: {
            index: 0
          }
          accounts: [{label: ''}]
        }
        createPayment: (p, shouldFail, failWith) -> new MyWalletPayment(MyWallet.wallet, p, shouldFail, failWith)
      }

      currency.conversions["EUR"] = { conversion: 1 }

      buySell.getExchange = () -> {
        getTrades: -> $q.resolve()
        getKYCs: -> $q.resolve()
        trades: {
          pending: {}
        }
        user: 1
        _profile: {
          _country: 'FR',
          level: {
            limits: {
              'card': {
                in: 300
              },
              'bank': {
                in: 0
              }
            }
          }
        }
      }

      payment = {
        absoluteFeeBounds: [100,100,100,100,100,100]
        sweepFees: [50,50,50,50,50,50]
      }
      buySell: {
        getQuote: (quote) -> $q.resolve(quote).then()
      }

  getController = (quote, trade, exchange) ->
    scope = $rootScope.$new()

    $controller "CoinifySellController",
      $scope: scope
      trade: trade || {}
      user: user || {}
      quote: quote || {}
      options: options || {}
      buySellOptions: buySellOptions || {}
      accounts: accounts || []
      bankMedium: bankMedium || {}
      payment: payment || {}
      exchange: exchange
      $uibModalInstance: { close: (->), dismiss: (->) }

  describe ".selectAccount()", ->
    beforeEach ->
      ctrl = getController(quote, trade)

    it "should set the bank account", ->
      ctrl = getController(quote, trade)
      ctrl.selectAccount({id: 12345})
      expect(ctrl.bankId).toEqual(12345)

  describe ".goTo()", ->
    beforeEach ->
      ctrl = undefined

    it "should go to account step", ->
      ctrl = getController(quote, trade)
      ctrl.goTo('account')
      expect(ctrl.step).toEqual(2)

  describe ".reset()", ->
    beforeEach ->
      ctrl = undefined

    it "should reset transaction amounts", ->
      ctrl = getController(quote, trade)
      ctrl.reset()
      expect(ctrl.transaction.btc).toEqual(null)
      expect(ctrl.transaction.fiat).toEqual(null)

  describe ".onCreateBankSuccess()", ->
    beforeEach ->
      ctrl = undefined

    it "should set the bankId", ->
      ctrl = getController(quote, trade)
      ctrl.onCreateBankSuccess({bank: {_id: 123456}})
      expect(ctrl.bankId).toEqual(123456)

  describe ".onSellSuccess()", ->
    beforeEach ->
      ctrl = undefined

    it "should set the bankId", ->
      ctrl = getController(quote, trade)
      ctrl.onSellSuccess({id: 123})
      expect(ctrl.sellTrade.id).toEqual(123)

  describe ".cancel()", ->
    beforeEach ->
      ctrl = undefined

    it "should reset the transaction", ->
      ctrl = getController(quote, trade)
      spyOn(ctrl, 'reset')
      ctrl.cancel()
      expect(ctrl.reset).toHaveBeenCalled()

  describe ".setTitle()", ->
    beforeEach ->
      ctrl = undefined

    it "should set the title for bank link", ->
      ctrl = getController(quote, trade)
      ctrl.setTitle('bank-link')
      expect(ctrl.title).toEqual('SELL.LINKED_ACCOUNTS')

    it "should set the title for summary", ->
      ctrl = getController(quote, trade)
      ctrl.setTitle('summary')
      expect(ctrl.title).toEqual('SELL.CONFIRM_SELL_ORDER')

    it "should set the title for trade-complete", ->
      ctrl = getController(quote, trade)
      ctrl.setTitle('trade-complete')
      expect(ctrl.title).toEqual('SELL.SELL_BITCOIN')

  describe ".now()", ->

    it "should get the time", ->
      ctrl = getController(quote, trade)
      ctrl.now()

  describe ".timeToExpiration()", ->
    beforeEach ->
      ctrl = undefined

    it "should return expiration time of quote", ->
      ctrl = getController(quote, trade)
      ctrl.timeToExpiration()
      expect(ctrl.timeToExpiration()).toEqual(100000000 - ctrl.now())

  describe ".refreshQuote()", ->
    beforeEach ->
      ctrl = undefined

    it "should refresh the quote", ->
      onRefreshQuote = (q) -> true
      ctrl = getController(quote, trade)
      spyOn(buySell, 'getSellQuote')
      ctrl.refreshQuote().then(onRefreshQuote)

  describe "initial state", ->
    beforeEach ->
      ctrl = undefined

    it "should go to isx step if isKYC", ->
      ctrl = getController(quote, trade)
      ctrl.isKYC = true
      ctrl.nextStep()
      expect(ctrl.onStep('isx')).toEqual(true)

    it "should go to trade-complete step", ->
      ctrl = getController(quote, trade)
      ctrl.trade._state = 'awaiting_transfer_in'
      ctrl.trade._iSignThisID = undefined
      ctrl.nextStep()
      expect(ctrl.onStep('trade-complete')).toEqual(true)

    it "should go to email step", ->
      ctrl = getController(quote, trade)
      ctrl.isKYC = false
      ctrl.user.isEmailVerified = false
      ctrl.nextStep()
      expect(ctrl.onStep('email')).toEqual(true)

    it "should go to accept-terms step", ->
      ctrl = getController(quote, trade)
      ctrl.exchange.user = false
      ctrl.user.isEmailVerified = true
      ctrl.nextStep()
      expect(ctrl.onStep('accept-terms')).toEqual(true)

    it "should go to account step", ->
      ctrl = getController(quote, trade)
      ctrl.exchange.user = true
      ctrl.accounts.length = 0
      ctrl.nextStep()
      expect(ctrl.onStep('account')).toEqual(true)

    it "should go to bank-link step", ->
      ctrl = getController(quote, trade)
      ctrl.exchange.user = true
      ctrl.accounts.length = 1
      ctrl.nextStep()
      expect(ctrl.onStep('bank-link')).toEqual(true)

  describe ".getQuoteHelper()", ->
    beforeEach ->
      ctrl = undefined

    it "should return the right copy", ->
      ctrl = getController(quote, trade)
      result = ctrl.getQuoteHelper()
      expect(result).toEqual('EST_QUOTE_1')

    it "should return the right copy", ->
      ctrl = getController(quote, trade)
      ctrl.quote.id = 123
      result = ctrl.getQuoteHelper()
      expect(result).toEqual('SELL.QUOTE_WILL_EXPIRE')
