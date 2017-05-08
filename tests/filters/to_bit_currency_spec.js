describe('toBitCurrencyFilter', () => {
  let $filter = null;
  let btcCurrencies = null;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function () {
    module('walletFilters');
    return inject(_$filter_ => $filter = _$filter_);
  });

  beforeEach(() =>
    angular.mock.inject(function ($injector) {
      let currency = $injector.get('currency');
      btcCurrencies = currency.bitCurrencies;
    })
  );

  it('should convert from satoshi to BTC', () => {
    let toBitCurrency = $filter('toBitCurrency');
    let BTC = btcCurrencies.filter(i => i.code === 'BTC')[0];
    expect(toBitCurrency(100000000, BTC)).toBe('1 BTC');
  });

  it('should convert from satoshi to mBTC', () => {
    let toBitCurrency = $filter('toBitCurrency');
    let mBTC = btcCurrencies.filter(i => i.code === 'mBTC')[0];
    expect(toBitCurrency(100000, mBTC)).toBe('1 mBTC');
  });

  it('should convert from satoshi to bits', () => {
    let toBitCurrency = $filter('toBitCurrency');
    let bits = btcCurrencies.filter(i => i.code === 'bits')[0];
    expect(toBitCurrency(100, bits)).toBe('1 bits');
  });

  it('should hide the currency name', () => {
    let toBitCurrency = $filter('toBitCurrency');
    expect(toBitCurrency(100000000, btcCurrencies[0], true)).toBe('1');
  });

  it('should not convert if amount is null', () => {
    let toBitCurrency = $filter('toBitCurrency');
    expect(toBitCurrency(null, btcCurrencies[0])).toBe('');
  });

  it('should not convert if currency is null', () => {
    let toBitCurrency = $filter('toBitCurrency');
    expect(toBitCurrency(100000000)).toBe('');
  });
});
