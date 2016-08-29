'use strict';

describe('currency', () => {

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(done => {
    inject(($rootScope, currency) => {
      currency.fetchExchangeRate().then(done);
      $rootScope.$apply();
    });
  });

  describe('fetchExchangeRate()', () => {
    it('should fetch the currency exchange rates', (done) => {
      inject((currency) => {
        let checkForConversions = () => {
          expect(currency.conversions.USD).toBeDefined();
          expect(currency.conversions.EUR).toBeDefined();
          done();
        };
        currency.fetchExchangeRate().then(checkForConversions);
      });
    });
  });

  describe('getFiatAtTime()', () => {
    let time    = 14495209897
      , amount  = 100
      , curr    = 'USD';

    it('should get a value from the server', (done) => {
      inject((currency) => {
        let checkForFiatValue = (fiatValue) => {
          expect(fiatValue).toEqual('100.00');
          done();
        };
        currency.getFiatAtTime(time, amount, curr).then(checkForFiatValue);
      });
    });

    it('should get a value from the cache', (done) => {
      inject((MyBlockchainApi, currency) => {
        currency.getFiatAtTime(time, amount, curr).then(() => {
          spyOn(MyBlockchainApi, 'getFiatAtTime').and.callThrough();
          let checkForServerCall = (fiatValue) => {
            expect(MyBlockchainApi.getFiatAtTime).not.toHaveBeenCalled();
            done();
          };
          currency.getFiatAtTime(time, amount, curr).then(checkForServerCall);
        });
      });
    });
  });

  describe('updateCoinifyCurrencies', () => {
    it('should set the coinify currencies correctly', inject((currency) => {
      let expected = [{ code: 'EUR', name: 'Euro' }, { code: 'USD', name: 'U.S. Dollar' }];
      currency.updateCoinifyCurrencies(['USD', 'EUR']);
      expect(currency.coinifyCurrencies).toEqual(expected);
    }));
  });

  describe('isBitcurrency()', () => {
    it('should identify "BTC" as a bit currency', inject((currency) => {
      let isBit = currency.isBitCurrency(currency.bitCurrencies[0]);
      expect(isBit).toEqual(true);
    }));

    it('should identify "mBTC" as a bit currency', inject((currency) => {
      let isBit = currency.isBitCurrency(currency.bitCurrencies[1]);
      expect(isBit).toEqual(true);
    }));

    it('should identify "bits" as a bit currency', inject((currency) => {
      let isBit = currency.isBitCurrency(currency.bitCurrencies[2]);
      expect(isBit).toEqual(true);
    }));

    it('should not identify "USD" as a bit currency', inject((currency) => {
      let isBit = currency.isBitCurrency(currency.currencies[0]);
      expect(isBit).toEqual(false);
    }));
  });

  describe('decimalPlacesForCurrency()', () => {
    it('should give "BTC" the right places', inject((currency) => {
      let decimals = currency.decimalPlacesForCurrency(currency.bitCurrencies[0]);
      expect(decimals).toEqual(8);
    }));

    it('should give "mBTC" the right places', inject((currency) => {
      let decimals = currency.decimalPlacesForCurrency(currency.bitCurrencies[1]);
      expect(decimals).toEqual(5);
    }));

    it('should give "bits" the right places', inject((currency) => {
      let decimals = currency.decimalPlacesForCurrency(currency.bitCurrencies[2]);
      expect(decimals).toEqual(2);
    }));

    it('should give fiat the right places', inject((currency) => {
      let decimals = currency.decimalPlacesForCurrency(currency.currencies[0]);
      expect(decimals).toEqual(2);
    }));
  });

  describe('convertToSatoshi()', () => {
    it('should not convert a null amount', inject((Wallet, currency) => {
      let conversion = currency.convertToSatoshi(null, currency.bitCurrencies[0]);
      expect(conversion).toEqual(null);
    }));

    it('should convert from BTC', inject((Wallet, currency) => {
      let conversion = currency.convertToSatoshi(0.0001, currency.bitCurrencies[0]);
      expect(conversion).toEqual(10000);
    }));

    it('should convert from mBTC', inject((Wallet, currency) => {
      let conversion = currency.convertToSatoshi(0.1, currency.bitCurrencies[1]);
      expect(conversion).toEqual(10000);
    }));

    it('should convert from bits', inject((Wallet, currency) => {
      let conversion = currency.convertToSatoshi(100, currency.bitCurrencies[2]);
      expect(conversion).toEqual(10000);
    }));

    it('should convert from EUR', inject((Wallet, currency) => {
      let conversion = currency.convertToSatoshi(40, currency.currencies[1]);
      expect(conversion).toEqual(16000000);
    }));
  });

  describe('convertFromSatoshi()', () => {
    it('should not convert a null amount', inject((currency) => {
      let conversion = currency.convertFromSatoshi(null, currency.bitCurrencies[0]);
      expect(conversion).toEqual(null);
    }));

    it('should convert to BTC', inject((currency) => {
      let conversion = currency.convertFromSatoshi(10000, currency.bitCurrencies[0]);
      expect(conversion).toEqual(0.0001);
    }));

    it('should convert to mBTC', inject((currency) => {
      let conversion = currency.convertFromSatoshi(10000, currency.bitCurrencies[1]);
      expect(conversion).toEqual(0.1);
    }));

    it('should convert to bits', inject((currency) => {
      let conversion = currency.convertFromSatoshi(10000, currency.bitCurrencies[2]);
      expect(conversion).toEqual(100);
    }));

    it('should convert to EUR', inject((currency) => {
      let conversion = currency.convertFromSatoshi(10000, currency.currencies[1]);
      expect(conversion).toEqual(0.025);
    }));
  });

  describe('formatCurrencyForView()', () => {
    let amount = 0.123456789;

    it('should format BTC', inject((Wallet, currency) => {
      let formatted = currency.formatCurrencyForView(amount, currency.bitCurrencies[0]);
      expect(formatted).toEqual('0.12345679 BTC');
    }));

    it('should format mBTC', inject((Wallet, currency) => {
      let formatted = currency.formatCurrencyForView(amount, currency.bitCurrencies[1]);
      expect(formatted).toEqual('0.12346 mBTC');
    }));

    it('should format bits', inject((Wallet, currency) => {
      let formatted = currency.formatCurrencyForView(amount, currency.bitCurrencies[2]);
      expect(formatted).toEqual('0.12 bits');
    }));

    it('should not format a null amount', inject((Wallet, currency) => {
      let formatted = currency.formatCurrencyForView(null, currency.currencies[0]);
      expect(formatted).toEqual(null);
    }));

    it('should format fiat currency', inject((Wallet, currency) => {
      let formatted = currency.formatCurrencyForView(amount, currency.currencies[0]);
      expect(formatted).toEqual('0.12 USD');
    }));

    it('should be able to format without the code', inject((currency) => {
      let formatted = currency.formatCurrencyForView(amount, currency.bitCurrencies[0], false);
      expect(formatted).toEqual('0.12345679');
    }));
  });

  describe('commaSeparate()', () => {
    let amounts = [100, 1000, 10000, 100000, 1000000, 1000.123];
    let expected = ['100', '1,000', '10,000', '100,000', '1,000,000', '1,000.123'];
    amounts.forEach((amount, i) => {
      it(`should separate ${amount}`, inject((currency) => {
        let withCommas = currency.commaSeparate(amount, currency.bitCurrencies[0]);
        expect(withCommas).toEqual(expected[i]);
      }));
    });
  });
});
