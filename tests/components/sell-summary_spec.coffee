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

  bankAccount = {
    sell: (bankId) -> $q.resolve(sellTrade)
  }

  handlers =
    transaction: transaction
    sellTrade: sellTrade
    bankAccount: bankAccount
    sellRateForm: true
    fields: true


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
      $q = $injector.get('$q')
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

  describe ".isDisabled()", ->
    beforeEach ->
      ctrl = undefined

    it "should be disabled if insufficient funds", ->
      ctrl = getController(handlers)
      ctrl.totalBalance = 0.001
      result = ctrl.isDisabled()
      expect(result).toEqual(true)

    it "should disable if the form is invalid", ->
      ctrl = getController(handlers)
      ctrl.sellRateForm.$valid = false
      result = ctrl.isDisabled()
      expect(result).toEqual(true)

    it "should disable if there is no quote attached to sell Trade", ->
      ctrl = getController(handlers)
      ctrl.totalBalane = 1
      ctrl.sellRateForm.$valid = true
      result = ctrl.isDisabled()
      expect(result).toEqual(undefined)

  describe ".sell()", ->
    beforeEach ->
      ctrl = undefined

    it "should set waiting to true", ->
      ctrl = getController(handlers)
      ctrl.sell()
      expect(ctrl.waiting).toEqual(true)

    it "should call bankAccount.sell(bankId)", ->
      ctrl = getController(handlers)
      spyOn(ctrl.bankAccount, 'sell')
      ctrl.sell()
      expect(ctrl.bankAccount.sell).toHaveBeenCalled()
