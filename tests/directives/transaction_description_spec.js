describe('Transaction Description Directive', () => {
  let $compile;
  let $rootScope;
  let element;
  let isoScope;
  let Wallet;
  let html;

  beforeEach(module('walletDirectives'));
  
  beforeEach(module('walletApp'));

  beforeEach(inject(function (_$compile_, _$rootScope_, $injector) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $compile = _$compile_;
    $rootScope = _$rootScope_;

    Wallet = $injector.get('Wallet');
    let MyWallet = $injector.get('MyWallet');

    Wallet.my = {
      wallet: {
        getAddressBookLabel () { return null; }
      }
    };

    MyWallet.wallet = {
      external: {
        addCoinify () {},
        coinify: {}
      }
    };

    Wallet.accounts = () => [{index: 0, label: "Savings"}, { index: 1, label: "Spending"}];

    $rootScope.transaction = {
      hash: "tx_hash",
      confirmations: 13,
      txType: 'send',
      time: 1441400781,
      processedInputs: [{ change: false, address: 'Savings' }],
      processedOutputs: [{ change: false, address: 'Spending' }, { change: true, address: '1asdf' }],
      to: []
    };

  })
  );

  beforeEach(function () {
    html = "<transaction-description transaction='transaction'></transaction-description>";
    element = $compile(html)($rootScope);
    $rootScope.$digest();
    return isoScope = element.isolateScope();
  });

  it('should set the year to yyyy if tx year is different than current year', () => {
    isoScope.tx.time = 1373101120065; // July 6 2013
    $rootScope.$digest();
    expect(isoScope.year).toBe('yyyy');
  });

  describe('getTxDirection', () => {
    it('should have correct translation when sent', () => expect(isoScope.getTxDirection('sent')).toEqual('SENT'));

    it('should have correct translation when received', () => expect(isoScope.getTxDirection('received')).toEqual('RECEIVED_BITCOIN_FROM'));

    it('should have correct translation when transferred', () => expect(isoScope.getTxDirection('transfer')).toEqual('MOVED_BITCOIN_TO'));
  });

  describe('getTxClass', () => {

    it('should return outgoing_tx class when sent', () => expect(isoScope.getTxClass('sent')).toEqual('outgoing_tx'));

    it('should return incoming_tx class when received', () => expect(isoScope.getTxClass('received')).toEqual('incoming_tx'));

    it('should return local_tx class when transferred', () => expect(isoScope.getTxClass('transfer')).toEqual('local_tx'));
  });

  it('should have the transaction in its scope', () => expect(isoScope.tx.hash).toBe("tx_hash"));

  it('should recognize an intra wallet transaction', () => {
    isoScope.tx.txType = 'transfer';

    element = $compile(html)($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain('translate="MOVED_BITCOIN_TO"');
  });

  it('should recognize sending from imported address', () => {
    isoScope.tx.txType = 'sent';
    isoScope.tx.result = -100000000;

    element = $compile(html)($rootScope);
    $rootScope.$digest();

    expect(element.html()).not.toContain('translate="MOVED_BITCOIN_TO"');
    expect(element.html()).toContain('translate="SENT"');
  });

  it('should recognize receiving to imported address', () => {
    isoScope.tx.txType = 'received';
    isoScope.tx.result = 100000000;

    element = $compile(html)($rootScope);
    $rootScope.$digest();

    expect(element.html()).not.toContain('translate="MOVED_BITCOIN_TO"');
    expect(element.html()).toContain('translate="RECEIVED_BITCOIN_FROM"');
  });
});
