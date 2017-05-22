describe('Trade Directive', () => {
  let element;
  let isoScope;
  let Wallet;
  let Alerts;
  let $q;

  beforeEach(module('walletDirectives'));
  
  beforeEach(module('walletApp'));

  beforeEach(inject(function ($compile, $rootScope, $injector, _$q_) {
    $q = _$q_;
    Wallet = $injector.get('Wallet');
    let MyWallet = $injector.get('MyWallet');
    Alerts = $injector.get('Alerts');

    MyWallet.wallet = {
      external: {
        addCoinify () {},
        coinify: {}
      }
    };

    let parentScope = $rootScope.$new();

    parentScope.trade = {
      state: 'pending',
      bitcionReceived: false
    };

    parentScope.buy = function () {};

    let html = "<trade trade='trade' buy='buy'></trade>";
    element = $compile(html)(parentScope);
    parentScope.$digest();
    return isoScope = element.isolateScope();
  })
  );

  it('should be passed a trade object', () => expect(isoScope.trade).toBeDefined());

  it('should be passed a buy function', () => expect(isoScope.buy).toBeDefined());

  describe('update()', () => {
    it('should set the error state', () => {
      isoScope.trade.state = "cancelled";
      isoScope.$digest();
      expect(isoScope.error).toEqual(true);
    });

    it('should set the success state', () => {
      isoScope.trade.state = "completed";
      isoScope.$digest();
      expect(isoScope.completed).toEqual(true);
    });

    it('should set the pending state', () => {
      isoScope.trade.state = "awaiting_transfer_in";
      isoScope.$digest();
      expect(isoScope.pending).toEqual(true);
    });

    it('should set the completed state', () => {
      isoScope.trade.state = "expired";
      isoScope.$digest();
      expect(isoScope.completed).toEqual(true);
    });
  });
});
