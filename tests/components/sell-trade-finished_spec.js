describe('sell-trade-finished.component', () => {
  let scope;
  let $rootScope;
  let Wallet;
  let $compile;
  let $templateCache;
  let $componentController;

  let sellTrade = {
    id: '12345',
    state: 'awaiting_transfer_in',
    inCurrency: 'BTC',
    outCurrency: 'EUR',
    outAmountExpected: 100,
    transferIn: {
      sendAmount: '.01527447',
      medium: 'blockchain'
    },
    transferOut: {
      details: {
        account: {
          number: '123456789ABCDEFG'
        }
      }
    }
  };

  let handlers = {
    sellTrade,
    completedState: false
  };

  let getController = function (bindings) {
    scope = $rootScope.$new();
    let ctrl = $componentController('sellTradeFinished', {$scope: scope}, bindings);
    let template = $templateCache.get('partials/coinify/sell-trade-finished.pug');
    $compile(template)(scope);
    return ctrl;
  };

  beforeEach(module('walletApp'));
  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$compile_, _$templateCache_, _$componentController_) {
      $rootScope = _$rootScope_;
      $compile = _$compile_;
      $templateCache = _$templateCache_;
      $componentController = _$componentController_;

      Wallet = $injector.get('Wallet');
      $injector.get('buySell');
    })
  );

  describe('btcSold', () =>

    it('should equal the btc amount sold', () => {
      let ctrl = getController(handlers);
      ctrl.btcSold = ctrl.sellTrade.transferIn.sendAmount * 100000000;
      expect(ctrl.btcSold).toEqual(1527447);
    })
  );

  describe('.showNote()', () =>
    it('should change the country', () => {
      let ctrl = getController(handlers);
      let result = ctrl.showNote();
      expect(result).toEqual(true);
    })
  );
  //
  describe('.tradeCompleted', () => {
    beforeEach(function () {
      let ctrl;
      ctrl = getController(handlers);
      ctrl.sellTrade.state = 'completed';
    });

    it('should be true if the state is completed', () => {
      let ctrl = getController(handlers);
      expect(ctrl.tradeCompleted).toEqual(true);
    });
  });

  describe('if completed state', () => {
    beforeEach(function () {
      handlers.completedState = 'completed';
    });

    it('should set properties if in completed state', () => {
      let ctrl = getController(handlers);
      expect(ctrl.isx).toEqual(true);
      expect(ctrl.completedState = 'SELL.ISX.COMPLETED');
    });
  });
});
