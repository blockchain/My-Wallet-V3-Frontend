'use strict';

describe('date.helper', () => {
    beforeEach(angular.mock.module('walletApp'));

    describe('now', () => {
        it('should return the now date in javascript format', inject((DateHelper) => {

            let expectedNow = new Date();

            let now = DateHelper.now();

            expect(now.getFullYear()).toEqual(expectedNow.getFullYear());
            expect(now.getMonth()).toEqual(expectedNow.getMonth());
            expect(now.getDate()).toEqual(expectedNow.getDate());
            expect(now.getHours()).toEqual(expectedNow.getHours());
            expect(now.getMinutes()).toEqual(expectedNow.getMinutes());
            expect(now.getSeconds()).toEqual(expectedNow.getSeconds());
        }));
    });

    describe('bitcoinStartDate', () => {
        it('should return the date 3rd January 2009 in javascript format', inject((DateHelper) => {

            let expectedBitcoinStartDate = new Date(2009, 0, 3);

            let bitcoinStartDate = DateHelper.bitcoinStartDate;

            expect(bitcoinStartDate.getFullYear()).toEqual(expectedBitcoinStartDate.getFullYear());
            expect(bitcoinStartDate.getMonth()).toEqual(expectedBitcoinStartDate.getMonth());
            expect(bitcoinStartDate.getDate()).toEqual(expectedBitcoinStartDate.getDate());
        }));
    });

    describe('round()', () => {
        it('should force the time components to be equal to 0', inject((DateHelper) => {

            let date = new Date(2017, 4, 26, 10, 20, 30, 123);

            let expectedRoundedDate = new Date(2017, 4, 26, 0, 0, 0, 0);

            let roundedDate = DateHelper.round(date);

            expect(roundedDate.getFullYear()).toEqual(expectedRoundedDate.getFullYear());
            expect(roundedDate.getMonth()).toEqual(expectedRoundedDate.getMonth());
            expect(roundedDate.getDate()).toEqual(expectedRoundedDate.getDate());
            expect(roundedDate.getHours()).toEqual(0);
            expect(roundedDate.getMinutes()).toEqual(0);
            expect(roundedDate.getSeconds()).toEqual(0);
            expect(roundedDate.getMilliseconds()).toEqual(0);
        }));
    });

    describe('toShortDate()', () => {
        it('should return a formatted string like dd/MM/yyyy', inject((DateHelper) => {

            let date = new Date(2017, 3, 26, 10, 20, 30, 123);

            let expectedShortDate = '26/04/2017';

            let shortDate = DateHelper.toShortDate(date);

            expect(shortDate).toEqual(expectedShortDate);
        }));
    });

    describe('toCustomShortDate()', () => {
        it('should return a formatted string like dd/MM/yyyy with separator /', inject((DateHelper) => {

            let date = new Date(2017, 3, 26, 10, 20, 30, 123);

            let expectedShortDate = '26/04/2017';

            let shortDate = DateHelper.toCustomShortDate('/', date);

            expect(shortDate).toEqual(expectedShortDate);
        }));

        it('should return a string with the right separator', inject((DateHelper) => {

            let date = new Date(2017, 3, 26, 10, 20, 30, 123);

            let expectedShortDate = '26-04-2017';

            let shortDate = DateHelper.toCustomShortDate('-', date);

            expect(shortDate).toEqual(expectedShortDate);
        }));
    });
});
