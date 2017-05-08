describe('label-origin.component', () => {
  let compileElement;

  beforeEach(module('walletApp'));
  beforeEach(inject(($compile, $rootScope) =>
    compileElement = function (origin) {
      $rootScope.origin = origin;
      let element = $compile("<label-origin origin='origin'></label-origin>")($rootScope);
      $rootScope.$digest();
      return element[0];
    }
  )
  );

  it('should display a label', () => {
    let element = compileElement({ label: 'my_address', address: '1abcd' });
    expect(element.innerHTML).toContain('my_address');
  });

  it('should display an address', () => {
    let element = compileElement({ address: '1abcd' });
    expect(element.innerHTML).toContain('1abcd');
  });

  it("should display a balance", inject(function (Wallet, currency) {
    Wallet.settings.displayCurrency = currency.bitCurrencies[0];
    let element = compileElement({ balance: 10000 });
    expect(element.innerHTML).toContain('(0.0001 BTC)');
  })
  );
});
