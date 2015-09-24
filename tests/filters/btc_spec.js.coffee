describe "btcFilter", ->

  $filter = null

  beforeEach ->
    inject (_$filter_) ->
      $filter = _$filter_

  it "should convert from satoshi", () ->
    btc = $filter('btc')
    expect(btc(100000000)).toBe('1 BTC')

  it "should hide the currency name", () ->
    btc = $filter('btc')
    expect(btc(100000000, true)).toBe('1')

  it "should not convert if currency is null", () ->
    btc = $filter('btc')
    expect(btc()).toBe('')
