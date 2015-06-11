describe "WalletFilters", ->

  $filter = null
  Wallet = null
  btcCurrencies = null

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    module('walletFilters')
    inject (_$filter_) ->
      $filter = _$filter_

  beforeEach ->
    angular.mock.inject ($injector) ->
      Wallet = $injector.get("Wallet")
      btcCurrencies = Wallet.btcCurrencies

  describe "toBitCurrency", ->

    it "should convert from satoshi to BTC", () ->
      toBitCurrency = $filter('toBitCurrency')
      BTC = btcCurrencies.filter((i) -> i.code == 'BTC')[0]
      expect(toBitCurrency(100000000, BTC)).toBe('1 BTC')

    it "should convert from satoshi to mBTC", () ->
      toBitCurrency = $filter('toBitCurrency')
      mBTC = btcCurrencies.filter((i) -> i.code == 'mBTC')[0]
      expect(toBitCurrency(100000, mBTC)).toBe('1 mBTC')

    it "should convert from satoshi to bits", () ->
      toBitCurrency = $filter('toBitCurrency')
      bits = btcCurrencies.filter((i) -> i.code == 'bits')[0]
      expect(toBitCurrency(100, bits)).toBe('1 bits')

    it "should hide the currency name", () ->
      toBitCurrency = $filter('toBitCurrency')
      expect(toBitCurrency(100000000, btcCurrencies[0], true)).toBe('1')

    it "should not convert if amount is null", () ->
      toBitCurrency = $filter('toBitCurrency')
      expect(toBitCurrency(null, btcCurrencies[0])).toBe('')

    it "should not convert if currency is null", () ->
      toBitCurrency = $filter('toBitCurrency')
      expect(toBitCurrency(100000000)).toBe('')

  describe "btc", ->

    it "should convert from satoshi", () -> 
      btc = $filter('btc')
      expect(btc(100000000)).toBe('1 BTC')

    it "should hide the currency name", () ->
      btc = $filter('btc')
      expect(btc(100000000, true)).toBe('1')

    it "should not convert if currency is null", () ->
      btc = $filter('btc')
      expect(btc()).toBe('')

  describe "getByProperty", ->

    it "should return the correct result", () ->
      getByProperty = $filter('getByProperty')
      result = getByProperty('code', 'mBTC', btcCurrencies)
      correct = btcCurrencies.filter((i) -> i.code == 'mBTC')[0]
      expect(result).toBe(correct)

  describe "getByPropertyNested", ->

    it "should return the correct result", () ->
      getByPropertyNested = $filter('getByPropertyNested')

      nested1 =
        a: [1, 2, 3]
        b: [4, 5, 6]
        c: [7, 8, 9]

      nested2 =
        a: [1, 2, 3]
        b: [4, 42, 6]
        c: [7, 8, 9]

      result = getByPropertyNested('b', 42, [nested1, nested2])
      expect(result).toBe(nested2)

    it "should return null if there is nothing to get", () ->
      getByPropertyNested = $filter('getByPropertyNested')
      result = getByPropertyNested('d', 9, [])
      expect(result).toBe(null)