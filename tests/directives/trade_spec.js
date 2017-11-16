describe('Trade Directive', () => {
  let element;
  let isoScope;

  beforeEach(module('walletDirectives'));
  
  beforeEach(module('walletApp'));

  beforeEach(() => {
    module(($provide) => {
      $provide.factory('Env', ($q) => $q.resolve({
        rootURL: 'https://blockchain.info/',
        webHardFork: {
          balanceMessage: { 'en': 'Balance message' }
        }
      }));
    });
  });

  beforeEach(inject(function ($compile, $rootScope, $injector, $q) {
    let MyWallet = $injector.get('MyWallet');

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

    parentScope.inspectTrade = function () {};

    let html = '<trade trade="trade" inspect-trade="inspectTrade"></trade>';
    element = $compile(html)(parentScope);
    parentScope.$digest();
    isoScope = element.isolateScope();
  })
  );

  it('should be passed a trade object', () => expect(isoScope.trade).toBeDefined());

  it('should be passed a details function', () => expect(isoScope.inspectTrade).toBeDefined());
});
