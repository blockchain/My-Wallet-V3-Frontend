describe "sell-quick-start.component", ->
  $rootScope = undefined
  $compile = undefined
  $templateCache = undefined
  $componentController = undefined
  $timeout = undefined
  $q = undefined
  scope = undefined
  Wallet = undefined
  exchange = undefined
  buySell = {}

  mockQuote = (fail) ->
    quoteAmount: 150
    rate: 867
    getPaymentMediums: () -> if fail then $q.reject(fail) else $q.resolve(mockMediums())

  transaction = {
    currency: {
      code: "EUR"
    },
    btc: 0.01,
    fiat: 100,
    fee: {
      btc: 0.0001
    }
  }

  quote = {
    quoteAmount: 1
    baseAmount: -100
    baseCurrency: 'EUR'
    getPaymentMediums: () -> $q.resolve()
  }

  handlers =
    transaction: transaction


  getController = (bindings) ->
    scope = $rootScope.$new(true)
    ctrl = $componentController("sellQuickStart", $scope: scope, bindings)
    template = $templateCache.get('templates/sell-quick-start.pug')
    $compile(template)(scope)
    ctrl

  beforeEach module("walletApp")
  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$compile_, _$templateCache_, _$componentController_) ->
      $rootScope = _$rootScope_
      $compile = _$compile_
      $templateCache = _$templateCache_
      $componentController = _$componentController_

      $timeout = $injector.get('$timeout')
      $q = $injector.get('$q')
      Wallet = $injector.get('Wallet')
      MyWallet = $injector.get("MyWallet")
      MyWalletHelpers = $injector.get('MyWalletHelpers')
      MyWalletPayment = $injector.get("MyWalletPayment")
      buySell = $injector.get("buySell")
      currency = $injector.get("currency")

      MyWallet.wallet = {}
      Wallet.accounts = () -> []
      Wallet.getDefaultAccount = () -> {}
      MyWalletHelpers.asyncOnce = (f) ->
        async = () -> f()
        async.cancel = () ->
        return async

      MyWallet.wallet = {
        createPayment: (p, shouldFail, failWith) -> new MyWalletPayment(MyWallet.wallet, p, shouldFail, failWith)
      }

      currency.conversions["EUR"] = { conversion: 1 }

      buySell.getQuote = () -> $q.resolve(quote)

      buySell.getSellQuote = (amount, curr, quoteCurr) -> $q.resolve(quote).then()

      buySell.getExchange = () -> {
        getTrades: -> $q.resolve()
        getKYCs: -> $q.resolve()
        trades: {
          pending: {}
        }
        user: 1
        profile: {
          country: 'FR',
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
          currentLimits: {
            bank: {
              outRemaining: 1000
            }
          }
        }
        kycs: []
        mediums: mediums
      }
      mediums =
        'card':
          getAccounts: () -> $q.resolve([])
        'bank':
          getAccounts: () -> $q.resolve([])



  describe "checkForNoFee()", ->
    beforeEach ->
      ctrl = undefined

    it "should call getDefaultAccountIndex", ->
      ctrl = getController(handlers)
      spyOn(Wallet, 'getDefaultAccountIndex')
      scope.checkForNoFee()
      expect(Wallet.getDefaultAccountIndex).toHaveBeenCalled()

  describe "offerUseAll()", ->
    beforeEach ->
      ctrl = undefined

    it "should set maxSpendableAmount to the first number in the array", ->
      ctrl = getController(handlers)
      paymentInfo = {
        maxSpendableAmounts: [1,2,3,4,5]
        sweepFees: [5,4,3,2,1]
      }
      payment = {}
      scope.offerUseAll(payment, paymentInfo)
      expect(scope.maxSpendableAmount).toEqual(1)

    describe "useAll()", ->
      beforeEach ->
        ctrl = undefined

      it "should set sweepTransaction to true", ->
        ctrl = getController(handlers)
        scope.useAll()
        expect(scope.isSweepTransaction).toEqual(true)

    # describe "getQuote()", ->
    #   beforeEach ->
    #     ctrl = undefined
    #
    #   it "should get a quote", ->
    #     ctrl = getController(handlers)
    #     scope.lastInput = 'btc'
    #     spyOn(buySell, 'getSellQuote')
    #     scope.getQuote()
    #     expect(buySell.getSellQuote).toHaveBeenCalled()
