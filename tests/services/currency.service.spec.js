'use strict';

describe('currency', () => {

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() => {
    angular.mock.inject(($injector) => {
      let Wallet = $injector.get('Wallet');
      Wallet.settings.currency = { code: 'USD' };
      Wallet.settings.btcCurrency = { code: 'BTC' };
      Wallet.settings.displayCurrency = { code: 'BTC' };
      Wallet.conversions = { USD: { conversion: 250 }, EUR: { conversion: 300 } };
    });
  });

  describe('toggleDisplayCurrency()', () => {
    it('should toggle the display currency', inject((Wallet, currency) => {
      currency.toggleDisplayCurrency();
      expect(Wallet.settings.displayCurrency.code).toEqual('USD');
    }));
  });

  describe('isBitCurrency()', () => {
    it('should identify "BTC" as a bit currency', inject((Wallet, currency) => {
      let isBit = currency.isBitCurrency(Wallet.btcCurrencies[0]);
      expect(isBit).toEqual(true);
    }));

    it('should identify "mBTC" as a bit currency', inject((Wallet, currency) => {
      let isBit = currency.isBitCurrency(Wallet.btcCurrencies[1]);
      expect(isBit).toEqual(true);
    }));

    it('should identify "bits" as a bit currency', inject((Wallet, currency) => {
      let isBit = currency.isBitCurrency(Wallet.btcCurrencies[2]);
      expect(isBit).toEqual(true);
    }));

    it('should not identify "USD" as a bit currency', inject((Wallet, currency) => {
      let isBit = currency.isBitCurrency(Wallet.currencies[0]);
      expect(isBit).toEqual(false);
    }));
  });

  describe('decimalPlacesForCurrency()', () => {
    it('should give "BTC" the right places', inject((Wallet, currency) => {
      let decimals = currency.decimalPlacesForCurrency(Wallet.btcCurrencies[0]);
      expect(decimals).toEqual(8);
    }));

    it('should give "mBTC" the right places', inject((Wallet, currency) => {
      let decimals = currency.decimalPlacesForCurrency(Wallet.btcCurrencies[1]);
      expect(decimals).toEqual(6);
    }));

    it('should give "bits" the right places', inject((Wallet, currency) => {
      let decimals = currency.decimalPlacesForCurrency(Wallet.btcCurrencies[2]);
      expect(decimals).toEqual(4);
    }));

    it('should give "USD" the right places', inject((Wallet, currency) => {
      let decimals = currency.decimalPlacesForCurrency(Wallet.currencies[0]);
      expect(decimals).toEqual(2);
    }));
  });

  describe('convertFromSatoshi()', () => {
    it('should not convert a null amount', inject((Wallet, currency) => {
      let conversion = currency.convertFromSatoshi(null, Wallet.btcCurrencies[0]);
      expect(conversion).toEqual(null);
    }));

    it('should convert to BTC', inject((Wallet, currency) => {
      let conversion = currency.convertFromSatoshi(10000, Wallet.btcCurrencies[0]);
      expect(conversion).toEqual(0.0001);
    }));

    it('should convert to mBTC', inject((Wallet, currency) => {
      let conversion = currency.convertFromSatoshi(10000, Wallet.btcCurrencies[1]);
      expect(conversion).toEqual(0.1);
    }));

    it('should convert to bits', inject((Wallet, currency) => {
      let conversion = currency.convertFromSatoshi(10000, Wallet.btcCurrencies[2]);
      expect(conversion).toEqual(100);
    }));

    it('should convert to USD', inject((Wallet, currency) => {
      let conversion = currency.convertFromSatoshi(10000, Wallet.currencies[0]);
      expect(conversion).toEqual(40);
    }));
  });

  describe('convertFromSatoshi()', () => {
    it('should not convert a null amount', inject((Wallet, currency) => {
      let conversion = currency.convertToSatoshi(null, Wallet.btcCurrencies[0]);
      expect(conversion).toEqual(null);
    }));

    it('should convert from BTC', inject((Wallet, currency) => {
      let conversion = currency.convertToSatoshi(0.0001, Wallet.btcCurrencies[0]);
      expect(conversion).toEqual(10000);
    }));

    it('should convert from mBTC', inject((Wallet, currency) => {
      let conversion = currency.convertToSatoshi(0.1, Wallet.btcCurrencies[1]);
      expect(conversion).toEqual(10000);
    }));

    it('should convert from bits', inject((Wallet, currency) => {
      let conversion = currency.convertToSatoshi(100, Wallet.btcCurrencies[2]);
      expect(conversion).toEqual(10000);
    }));

    it('should convert from USD', inject((Wallet, currency) => {
      let conversion = currency.convertToSatoshi(40, Wallet.currencies[0]);
      expect(conversion).toEqual(10000);
    }));
  });

  describe('formatCurrencyForView()', () => {
    let amount = 0.123456789;
    let viewValues = ['0.12345679 BTC', '0.123457 mBTC', '0.1235 bits'];

    for (let i in viewValues) {
      it(`should format btc currency ${i}`, inject((Wallet, currency) => {
        let formatted = currency.formatCurrencyForView(amount, Wallet.btcCurrencies[i]);
        expect(formatted).toEqual(viewValues[i]);
      }));
    }

    it('should not format a null amount', inject((Wallet, currency) => {
      let formatted = currency.formatCurrencyForView(null, Wallet.currencies[0]);
      expect(formatted).toEqual(null);
    }));

    it('should format fiat currency', inject((Wallet, currency) => {
      let formatted = currency.formatCurrencyForView(amount, Wallet.currencies[0]);
      expect(formatted).toEqual('0.12 USD');
    }));

    it('should be able to format without the code', inject((Wallet, currency) => {
      let formatted = currency.formatCurrencyForView(amount, Wallet.btcCurrencies[0], false);
      expect(formatted).toEqual('0.12345679');
    }));
  });

});
