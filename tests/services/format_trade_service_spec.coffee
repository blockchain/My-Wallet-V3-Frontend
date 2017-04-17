describe "formatTrade service", () ->
	formatTrade = undefined
	$rootScope = undefined

	beforeEach angular.mock.module("walletApp")

	beforeEach ->
		angular.mock.inject ($injector, _$rootScope_, _$q_) ->
			$rootScope = _$rootScope_
			$q = _$q_
			Wallet = $injector.get("Wallet")

			formatTrade = $injector.get("formatTrade")

			spyOn(formatTrade, "labelsForCurrency").and.callThrough()

	trade = (currency) ->
		state: "awaiting_transfer_in"
		inCurrency: currency
		bankAccount: {
			holder_name: "Coinify"
			bankAddress: {
				city: "city"
				country: "DK"
				state: "00"
				street: "street name"
				zipcode: "1234"
			}
			number: "1234567"
			bic: "1234"
			bank_name: "bc bank"
			holderAddress: {
				city: "city"
				country: "DK"
				state: "00"
				street: "street"
				zipcode: "1234"
			}
			referenceText: "AB12345"
		}

	beforeEach ->
		$rootScope.$digest()

	describe "bank trade", ->
		beforeEach ->
			spyOn(formatTrade, "bank_transfer").and.callThrough()

		it "should return the correct labels", ->
			trade = trade("DKK")
			formatTrade.bank_transfer(trade)
			expect(formatTrade.bank_transfer).toHaveBeenCalled()
			result = formatTrade.labelsForCurrency(trade.inCurrency)
			expect(result).toEqual({accountNumber: "Account Number", bankCode: "Reg. Number"})
