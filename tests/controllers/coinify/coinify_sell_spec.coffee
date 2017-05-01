describe "CoinifySellController", ->
  $rootScope = undefined
  $controller = undefined
  options = undefined
  buySell = undefined
  buySellOptions = undefined
  $scope = undefined
  accounts = undefined
  masterPaymentAccount = undefined
  payment = undefined
  trade = undefined
  exchange = undefined
  user = undefined

  quote = {
    quoteAmount: 1
    baseAmount: -100
    baseCurrency: 'EUR'
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
      masterPaymentAccount: masterPaymentAccount || {}
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
      ctrl.onCreateBankSuccess(123456)
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
