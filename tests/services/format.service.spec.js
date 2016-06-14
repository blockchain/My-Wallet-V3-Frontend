'use strict';

describe('format', () => {

  beforeEach(angular.mock.module('walletApp'));

  describe("origin()", () => {
    it('should format an account', inject((format) => {
      expect(format.origin({
        label : "Savings",
        index : 0,
        balance : 1,
        archived : false,
        isWatchOnly : false,
        extendedPublicKey: 'xpub_Savings'
      })).toEqual({
        label : "Savings",
        index : 0,
        address : undefined,
        balance : 1,
        archived : false,
        type : 'Accounts',
        xpub: 'xpub_Savings'
      });
    }));

    it('should format an address', inject((format) => {
      expect(format.origin({
        label : "Imported",
        index: undefined,
        address: "1234ab",
        balance : 1,
        archived : false,
        isWatchOnly : false
      })).toEqual({
        label : "Imported",
        index: undefined,
        address : "1234ab",
        balance : 1,
        archived : false,
        type : 'Imported Addresses',
        isWatchOnly : false
      });
    }));
  });

  describe("destination()", () => {
    it('should be the same as origin', inject((format) => {
      expect(format.origin).toEqual(format.destination);
    }));
  });



});
