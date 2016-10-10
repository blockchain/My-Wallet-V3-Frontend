'use strict';

describe('format', () => {
  beforeEach(angular.mock.module('walletApp'));

  describe('origin()', () => {
    it('should format an account', inject((format) => {
      let formatted = format.origin({
        label: 'Savings',
        index: 0,
        balance: 1,
        archived: false,
        isWatchOnly: false,
        extendedPublicKey: 'xpub_Savings'
      });

      expect(formatted.label).toEqual('Savings');
      expect(formatted.index).toEqual(0);
      expect(formatted.address).not.toBeDefined();
      expect(formatted.balance).toEqual(1);
      expect(formatted.archived).toEqual(false);
      expect(formatted.type).toEqual('Accounts');
      expect(formatted.xpub).toEqual('xpub_Savings');
    }));

    it('should format an address', inject((format) => {
      let formatted = format.origin({
        label: 'Imported',
        index: undefined,
        address: '1234ab',
        balance: 1,
        archived: false,
        isWatchOnly: false
      });

      expect(formatted.label).toEqual('Imported');
      expect(formatted.index).not.toBeDefined();
      expect(formatted.address).toEqual('1234ab');
      expect(formatted.balance).toEqual(1);
      expect(formatted.archived).toEqual(false);
      expect(formatted.type).toEqual('Imported Addresses');
      expect(formatted.isWatchOnly).toEqual(false);
    }));
  });

  describe('destination()', () => {
    it('should be the same as origin', inject((format) => {
      expect(format.origin).toEqual(format.destination);
    }));
  });
});
