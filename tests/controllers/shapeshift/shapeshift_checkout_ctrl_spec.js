describe('ShapeShiftCheckoutController', () => {
  let scope;
  let modals;
  let ctrl;
  let ShapeShift;
  let $rootScope;
  let $controller;
  let MyWallet;
  let Wallet;
  let $q;

  beforeEach(angular.mock.module('walletApp'));

  let mockTrade = (complete) =>
    ({
      pair: 'btc_eth',
      fromCurrency: 'btc',
      isComplete: complete,
      isProcessing: !complete
    });

  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$controller_, _$q_, _$timeout_, $httpBackend) {
      // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();

      $rootScope = _$rootScope_;
      $q = _$q_;
      $controller = _$controller_;

      modals = $injector.get('modals');
      Wallet = $injector.get('Wallet');
      MyWallet = $injector.get('MyWallet');
      Wallet.accounts = () => [{label: 'My Bitcoin Wallet', coinCode: 'btc'}, {label: 'My Other Bitcoin Wallet', coinCode: 'btc'}];
      modals.openShiftTradeDetails = (trade) => $q.resolve();
      
      MyWallet.wallet = {
        bch: {
          accounts: [
            {label: 'My Bitcoin Cash Wallet', coinCode: 'bch'}
          ]
        }
      }
    })
  );

  beforeEach(function () {
    ShapeShift = {
      shapeshift: {
        trades: [mockTrade(true), mockTrade(false)]
      },
      getUSAState () {
        return 'NY';
      },
      setUSAState (state) {
        return true;
      }
    };
  });

  let getControllerScope = function (params) {
    if (params == null) { params = {}; }
    scope = $rootScope.$new();
    ctrl = $controller('ShapeShiftCheckoutController',
      {$scope: scope,
       ShapeShift: ShapeShift});
    return scope;
  };

  beforeEach(function () {
    scope = getControllerScope();
    return $rootScope.$digest();
  });

  it('should define code currency dictionary', () => {
    expect(ctrl.human).toBeDefined();
  });

  describe('tabs', () => {
    describe('select', () => {
      it('should select a tab', () => {
        ctrl.tabs.select('ORDER_HISTORY');
        expect(ctrl.tabs.selectedTab).toBe('ORDER_HISTORY');
      });
    });
  });

  describe('onStep()', () => {
    it('should check if on specific step', () => {
      ctrl.step = 2;
      expect(ctrl.onStep('confirm')).toBe(true);
      expect(ctrl.onStep('receipt')).toBe(false);
    });
  });

  describe('openTradeDetails()', () => {
    it('should open trade details modal', () => {
      spyOn(modals, 'openShiftTradeDetails');
      ctrl.openTradeDetails(mockTrade);
      expect(modals.openShiftTradeDetails).toHaveBeenCalledWith(mockTrade);
    });
  });

  describe('completedTrades()', () => {
    it('should return true if there are some completed trades', () => {
      expect(ctrl.completedTrades()).toBe(true);
    });
  });

  describe('pendingTrades()', () => {
    it('should return true if there are some pending trades', () => {
      expect(ctrl.pendingTrades()).toBe(true);
    });
  });
});
