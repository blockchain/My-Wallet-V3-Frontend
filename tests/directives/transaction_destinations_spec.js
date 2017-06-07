describe('Transaction Destinations Directive', () => {
  let $compile;
  let $rootScope;
  let element;
  let isoScope;
  let Wallet;

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

    $rootScope.transaction = {
      hash: "tx_hash",
      confirmations: 13,
      txType: 'received',
      time: 1441400781,
      processedInputs: [
        { coinType: 'external', change: false, address: '1hEK8DyKGmfqe', identity: undefined, label: '1hEK8DyKGmfqe' },
        { coinType: 'external', change: false, address: '128U681k8wmTF', identity: undefined, label: '128U681k8wmTF' }
      ],
      processedOutputs: [
        { coinType: 'external', change: false, address: '1HBuQueUCQfi', identity: undefined, label: '1HBuQueUCQfi' },
        { coinType: '0/0/0', change: false, address: '1GkMfp61zCoEaEd4s', identity: 0, label: 'My Bitcoin Wallet' }
      ]
    };

  })
  );

  beforeEach(function () {
    let html = "<transaction-destinations transaction='transaction'></transaction-destinations>";
    element = $compile(html)($rootScope);
    $rootScope.$digest();
    return isoScope = element.isolateScope();
  });

  describe('txLabels for received txs', function () {

    it('should have one primary label', () => expect(isoScope.txLabels.primary[0].label).toBe('1hEK8DyKGmfqe'));

    it('should display the account received to as the secondary label', () => expect(isoScope.txLabels.secondary[0].label).toBe('My Bitcoin Wallet'));
  });

  describe('txLabels for sent txs', function () {

    beforeEach(function () {
      $rootScope.transaction = {
        txType: 'sent',
        processedInputs: [
          { coinType: '0/0/0', change: false, address: '13AzmeTswpa8t3', identity: 1, label: 'Testing' }
        ],
        processedOutputs: [
          { coinType: '0/0/0', change: true, address: '16JLCjTbSwZi3u5', identity: 1, label: 'Testing' },
          { coinType: 'external', change: false, address: '12LV2iRVZR', identity: undefined, label: '12LV2iRVZR' },
          { coinType: 'external', change: false, address: '1FYQe1ANT', identity: undefined, label: '1FYQe1ANT' },
          { coinType: 'external', change: false, address: '1PEAb1abhx6', identity: undefined, label: '1PEAb1abhx6' }
        ]
      };

      let html = "<transaction-destinations transaction='transaction'></transaction-destinations>";
      element = $compile(html)($rootScope);
      $rootScope.$digest();
      return isoScope = element.isolateScope();
    });

    it('should display a label preview', () => expect(isoScope.txLabels.preview).toContain('RECIPIENTS'));

    it('should hide the bucket of addresses when not toggled', () => {
      let recipients = element[0].querySelectorAll('span')[3];
      expect(angular.element(recipients).hasClass('ng-hide')).toBe(true);
    });

    it('should show the bucket of addresses when toggled', () => {
      isoScope.transaction.toggled = true;
      isoScope.$digest();
      let recipients = element[0].querySelectorAll('span')[3];
      expect(angular.element(recipients).hasClass('ng-hide')).toBe(false);
    });
  });
});
