describe "btcFilter", ->

  beforeEach(module('walletApp'))
  beforeEach(module('walletFilters'))

  it "should convert from satoshi", inject(($filter) ->
    btc = $filter('btc')
    expect(btc(100000000)).toBe('1 BTC')
  )

  it "should hide the currency name", inject(($filter) ->
    btc = $filter('btc')
    expect(btc(100000000, true)).toBe('1')
  )

  it "should not convert if currency is null", inject(($filter) ->
    btc = $filter('btc')
    expect(btc()).toBe('')
  )
