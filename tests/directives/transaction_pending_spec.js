describe('Transaction Pending Directive', () => {  
  let $compile;
  let $rootScope;
  let element;
  let isoScope;

  beforeEach(module('walletApp'));

  beforeEach(inject(function (_$compile_, _$rootScope_, $injector) {

    // The injector unwraps the underscores (_) from around the parameter names when matching
    $compile = _$compile_;
    $rootScope = _$rootScope_;

    $rootScope.transaction = {
      hash: "tx_hash",
      confirmations: 1,
      txType: 'sent'
    };

  })
  );

  beforeEach(function () {
    let html = "<transaction-pending transaction='transaction'></transaction-pending>";
    element = $compile(html)($rootScope);
    $rootScope.$digest();
    return isoScope = element.isolateScope();
  });

  describe('label for pending tx', function () {

    it("should display if < 3 confirmations", () => expect(isoScope.complete).toBe(false));

    it('should assign the sent message to the tooltip', () => {
      isoScope.pendingMessage($rootScope.transaction);
      expect(isoScope.message).toBe('PENDING_TX_SENDER');
    });

    it('should not display if confirmations >= 3', () => {
      isoScope.transaction.confirmations = 3;
      let html = "<transaction-pending transaction='transaction'></transaction-pending>";
      element = $compile(html)($rootScope);
      $rootScope.$digest();
      isoScope = element.isolateScope();
      expect(isoScope.complete).toBe(true);
    });
  });
});
