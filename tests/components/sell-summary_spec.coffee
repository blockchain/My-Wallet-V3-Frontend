describe "sell-summary.component", ->
  $q = undefined
  scope = undefined
  Wallet = undefined
  $rootScope = undefined
  buySell = undefined
  $rootScope = undefined
  $compile = undefined
  $templateCache = undefined
  $componentController = undefined

  transaction = {
    currency: {
      code: "DKK"
    },
    btc: 0.01,
    fiat: 100,
    fee: {
      btc: 0.0001
    }
  }

  sellTrade = {
    id: '12345',
    state: 'awaiting_transfer_in',
    inCurrency: 'BTC',
    outCurrency: 'EUR',
    outAmountExpected: 100,
    transferIn: {
      sendAmount: '.01527447',
      medium: 'blockchain'
    }
    transferOut: {
      details: {
        account: {
          number: '123456789ABCDEFG'
        }
      }
    }
  }


  handlers =
    transaction: transaction
    sellTrade: sellTrade


  getController = (bindings) ->
    scope = $rootScope.$new()
    ctrl = $componentController("sellSummary", $scope: scope, bindings)
    template = $templateCache.get('partials/coinify/sell-summary.pug')
    $compile(template)(scope)
    ctrl

  beforeEach module("walletApp")
  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$compile_, _$templateCache_, _$componentController_) ->
      $rootScope = _$rootScope_
      $compile = _$compile_
      $templateCache = _$templateCache_
      $componentController = _$componentController_

      Wallet = $injector.get("Wallet")
      buySell = $injector.get("buySell")

  describe ".insufficientFunds()", ->
    beforeEach ->
      ctrl = undefined

    it "should be true if the wallet does not have enough funds", ->
      ctrl = getController(handlers)
      ctrl.totalBalance = 0.001
      result = ctrl.insufficientFunds()
      expect(result).toEqual(true)
