describe('Amount', () => {
  let $compile;
  let $rootScope;
  let element;
  let isoScope;

  beforeEach(module('walletApp'));

  beforeEach(inject(function (_$compile_, _$rootScope_, Wallet) {
    $compile = _$compile_;
    return $rootScope = _$rootScope_;
  })
  );

  beforeEach(function () {
    element = $compile("<amount></amount>")($rootScope);
    $rootScope.$digest();
    isoScope = element.isolateScope();
    return isoScope.$digest();
  });

  it("should not show Fiat if BTC is set as display currency", inject(function (Wallet) {
    Wallet.settings.displayCurrency = {code: "BTC"};
    expect(isoScope.isBitCurrency(Wallet.settings.displayCurrency)).toBe(true);
  })
  );

  it("should show Fiat if BTC is not set as display currency", inject(function (Wallet) {
    Wallet.settings.displayCurrency = {code: "USD"};
    expect(isoScope.isBitCurrency(Wallet.settings.displayCurrency)).toBe(false);
  })
  );

  it("should respond to toggle elsewhere", inject(function (currency) {
    isoScope.settings.displayCurrency = currency.currencies[1];
    expect(isoScope.settings.displayCurrency.code).toBe("EUR");
  })
  );
});
