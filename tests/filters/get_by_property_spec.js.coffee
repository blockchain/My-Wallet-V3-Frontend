describe "getByPropertyFilter", ->

  $filter = null

  btcCurrencies = [
    { serverCode: 'BTC', code: 'BTC', conversion: 100000000 },
    { serverCode: 'MBC', code: 'mBTC', conversion: 100000 },
    { serverCode: 'UBC', code: 'bits', conversion: 100 }
  ]

  beforeEach ->
    inject (_$filter_) ->
      $filter = _$filter_

  it "should return the correct result", () ->
    getByProperty = $filter('getByProperty')
    result = getByProperty('code', 'mBTC', btcCurrencies)
    correct = btcCurrencies.filter((i) -> i.code == 'mBTC')[0]
    expect(result).toBe(correct)
