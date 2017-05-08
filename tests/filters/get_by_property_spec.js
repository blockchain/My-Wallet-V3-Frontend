describe('getByPropertyFilter', () => {
  let $filter = null;

  let btcCurrencies = [
    { serverCode: 'BTC', code: 'BTC', conversion: 100000000 },
    { serverCode: 'MBC', code: 'mBTC', conversion: 100000 },
    { serverCode: 'UBC', code: 'bits', conversion: 100 }
  ];

  beforeEach(function () {
    module('walletFilters');
    return inject(_$filter_ => $filter = _$filter_);
  });

  it('should return the correct result', () => {
    let getByProperty = $filter('getByProperty');
    let result = getByProperty('code', 'mBTC', btcCurrencies);
    let correct = btcCurrencies.filter(i => i.code === 'mBTC')[0];
    expect(result).toBe(correct);
  });
});
