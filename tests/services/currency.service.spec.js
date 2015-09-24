'use strict';

describe('Currency', () => {

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(inject((Currency) => {
    Currency.updateConversion('USD', { conversion: 250 });
    Currency.updateConversion('EUR', { conversion: 300 });
  }));

  describe('isBitCurrency()', () => {
    it('should identify "BTC" as a bit currency', inject((Wallet, Currency) => {
      let isBit = Currency.isBitCurrency(Wallet.btcCurrencies[0]);
      expect(isBit).toEqual(true);
    }));

    it('should identify "mBTC" as a bit currency', inject((Wallet, Currency) => {
      let isBit = Currency.isBitCurrency(Wallet.btcCurrencies[1]);
      expect(isBit).toEqual(true);
    }));

    it('should identify "bits" as a bit currency', inject((Wallet, Currency) => {
      let isBit = Currency.isBitCurrency(Wallet.btcCurrencies[2]);
      expect(isBit).toEqual(true);
    }));

    it('should not identify "USD" as a bit currency', inject((Wallet, Currency) => {
      let isBit = Currency.isBitCurrency(Wallet.currencies[0]);
      expect(isBit).toEqual(false);
    }));
  });

  describe('decimalPlacesForCurrency()', () => {
    it('should give "BTC" the right places', inject((Wallet, Currency) => {
      let decimals = Currency.decimalPlacesForCurrency(Wallet.btcCurrencies[0]);
      expect(decimals).toEqual(8);
    }));

    it('should give "mBTC" the right places', inject((Wallet, Currency) => {
      let decimals = Currency.decimalPlacesForCurrency(Wallet.btcCurrencies[1]);
      expect(decimals).toEqual(6);
    }));

    it('should give "bits" the right places', inject((Wallet, Currency) => {
      let decimals = Currency.decimalPlacesForCurrency(Wallet.btcCurrencies[2]);
      expect(decimals).toEqual(4);
    }));

    it('should give "USD" the right places', inject((Wallet, Currency) => {
      let decimals = Currency.decimalPlacesForCurrency(Wallet.currencies[0]);
      expect(decimals).toEqual(2);
    }));
  });

  describe('convertFromSatoshi()', () => {
    it('should not convert a null amount', inject((Wallet, Currency) => {
      let conversion = Currency.convertFromSatoshi(null, Wallet.btcCurrencies[0]);
      expect(conversion).toEqual(null);
    }));

    it('should convert to BTC', inject((Wallet, Currency) => {
      let conversion = Currency.convertFromSatoshi(10000, Wallet.btcCurrencies[0]);
      expect(conversion).toEqual(0.0001);
    }));

    it('should convert to mBTC', inject((Wallet, Currency) => {
      let conversion = Currency.convertFromSatoshi(10000, Wallet.btcCurrencies[1]);
      expect(conversion).toEqual(0.1);
    }));

    it('should convert to bits', inject((Wallet, Currency) => {
      let conversion = Currency.convertFromSatoshi(10000, Wallet.btcCurrencies[2]);
      expect(conversion).toEqual(100);
    }));

    it('should convert to USD', inject((Wallet, Currency) => {
      let conversion = Currency.convertFromSatoshi(10000, Wallet.currencies[0]);
      expect(conversion).toEqual(40);
    }));
  });

  describe('convertFromSatoshi()', () => {
    it('should not convert a null amount', inject((Wallet, Currency) => {
      let conversion = Currency.convertToSatoshi(null, Wallet.btcCurrencies[0]);
      expect(conversion).toEqual(null);
    }));

    it('should convert from BTC', inject((Wallet, Currency) => {
      let conversion = Currency.convertToSatoshi(0.0001, Wallet.btcCurrencies[0]);
      expect(conversion).toEqual(10000);
    }));

    it('should convert from mBTC', inject((Wallet, Currency) => {
      let conversion = Currency.convertToSatoshi(0.1, Wallet.btcCurrencies[1]);
      expect(conversion).toEqual(10000);
    }));

    it('should convert from bits', inject((Wallet, Currency) => {
      let conversion = Currency.convertToSatoshi(100, Wallet.btcCurrencies[2]);
      expect(conversion).toEqual(10000);
    }));

    it('should convert from USD', inject((Wallet, Currency) => {
      let conversion = Currency.convertToSatoshi(40, Wallet.currencies[0]);
      expect(conversion).toEqual(10000);
    }));
  });

  describe('formatCurrencyForView()', () => {
    let amount = 0.123456789;
    let viewValues = ['0.12345679 BTC', '0.123457 mBTC', '0.1235 bits'];

    for (let i in viewValues) {
      it(`should format btc currency ${i}`, inject((Wallet, Currency) => {
        let formatted = Currency.formatCurrencyForView(amount, Wallet.btcCurrencies[i]);
        expect(formatted).toEqual(viewValues[i]);
      }));
    }

    it('should not format a null amount', inject((Wallet, Currency) => {
      let formatted = Currency.formatCurrencyForView(null, Wallet.currencies[0]);
      expect(formatted).toEqual(null);
    }));

    it('should format fiat currency', inject((Wallet, Currency) => {
      let formatted = Currency.formatCurrencyForView(amount, Wallet.currencies[0]);
      expect(formatted).toEqual('0.12 USD');
    }));

    it('should be able to format without the code', inject((Wallet, Currency) => {
      let formatted = Currency.formatCurrencyForView(amount, Wallet.btcCurrencies[0], false);
      expect(formatted).toEqual('0.12345679');
    }));
  });

});
