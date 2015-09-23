describe "toBitCurrencyFilter", ->

  $filter = null
  Wallet = null
  btcCurrencies = null

  beforeEach ->
    inject (_$filter_) ->
      $filter = _$filter_

  beforeEach ->
    angular.mock.inject ($injector) ->
      Wallet = $injector.get("Wallet")
      btcCurrencies = Wallet.btcCurrencies

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
