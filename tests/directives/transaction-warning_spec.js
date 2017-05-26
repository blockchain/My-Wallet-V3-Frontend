describe('Transaction Warning Directive', () => {
  let $compile;
  let $rootScope;
  let element;
  let isoScope;
  let Wallet;
  let html;

  beforeEach(module('walletDirectives'));
  
  beforeEach(module('walletApp'));

  beforeEach(inject(function (_$compile_, _$rootScope_, $injector, $httpBackend) {

    // The injector unwraps the underscores (_) from around the parameter names when matching
    $compile = _$compile_;
    $rootScope = _$rootScope_;

    // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
    $httpBackend.whenGET('/Resources/wallet-options.json').respond();

    Wallet = $injector.get('Wallet');

    Wallet.my = {
      wallet: {
        getAddressBookLabel () { return null; }
      }
    };

    Wallet.accounts = () => [{index: 0, label: "Savings"}, { index: 1, label: "Spending"}];

    $rootScope.transaction = {
      hash: "tx_hash",
      confirmations: 13,
      txType: 'send',
      time: 1441400781,
      processedInputs: [{ change: false, address: 'Savings' }],
      processedOutputs: [{ change: false, address: 'Spending' }, { change: true, address: '1asdf' }]
    };

  })
  );

  beforeEach(function () {
    html = "<transaction-warning transaction='transaction'></transaction-warning>";
    element = $compile(html)($rootScope);
    $rootScope.$digest();
    return isoScope = element.isolateScope();
  });

  it('should not show warnings for double spend txs', () => {
    expect(element[0].outerHTML).toContain('ng-hide');
    isoScope.tx.double_spend = true;
    isoScope.tx.rbf = true;
    expect().not.toContain('ng-hide');
  });
});
