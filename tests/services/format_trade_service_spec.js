describe('formatTrade service', () => {
	let formatTrade;
	let $rootScope;

	beforeEach(angular.mock.module('walletApp'));

	beforeEach(() =>
		angular.mock.inject(function ($injector, _$rootScope_, _$q_, $httpBackend) {
			// TODO: use Wallet mock, so we don't need to mock this $httpBackend call
	    $httpBackend.whenGET('/Resources/wallet-options.json').respond();
			$rootScope = _$rootScope_;
			let $q = _$q_;
			let Wallet = $injector.get('Wallet');

			formatTrade = $injector.get('formatTrade');

			return spyOn(formatTrade, 'labelsForCurrency').and.callThrough();
		})
	);

	let trade = currency =>
		({
			state: "awaiting_transfer_in",
			inCurrency: currency,
			bankAccount: {
				holder_name: "Coinify",
				bankAddress: {
					city: "city",
					country: "DK",
					state: "00",
					street: "street name",
					zipcode: "1234"
				},
				number: "1234567",
				bic: "1234",
				bank_name: "bc bank",
				holderAddress: {
					city: "city",
					country: "DK",
					state: "00",
					street: "street",
					zipcode: "1234"
				},
				referenceText: "AB12345"
			}
		})
	;

	beforeEach(() => $rootScope.$digest());

	describe('bank trade', () => {
		beforeEach(() => spyOn(formatTrade, 'awaiting_transfer_in').and.callThrough());

		it('should return the correct labels', () => {
			trade = trade("DKK");
			formatTrade.awaiting_transfer_in(trade);
			expect(formatTrade.awaiting_transfer_in).toHaveBeenCalled();
			let result = formatTrade.labelsForCurrency(trade.inCurrency);
			expect(result).toEqual({accountNumber: "Account Number", bankCode: "Reg. Number"});
		});
	});
});
