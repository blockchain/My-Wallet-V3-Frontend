describe('ShapeShiftCheckoutController', () => {
  let scope;
  let modals;
  let ctrl;
  let ShapeShift;
  let $rootScope;
  let $controller;
  let $q;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$controller_, _$q_, _$timeout_, $httpBackend) {
      // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();

      $rootScope = _$rootScope_;
      $q = _$q_;
      $controller = _$controller_;

      modals = $injector.get('modals');
      modals.openShiftTradeDetails = (trade) => $q.resolve();
    })
  );

  beforeEach(function () {
    ShapeShift = {
      shapeshift: {
        trades: [true, true, false]
      }
    };
  });

  let getControllerScope = function (params) {
    if (params == null) { params = {}; }
    scope = $rootScope.$new();
    scope.vm = {
      goTo: (step) => { scope.vm.step = step; },
      trade: 'a b c'
    };
    ctrl = $controller('ShapeShiftCheckoutController',
      {$scope: scope,
       ShapeShift: ShapeShift});
    return scope;
  };

  let mockTrade = () =>
    ({
      id: 'TRADE',
      refresh () {},
      watchAddress () {}
    })
  ;

  beforeEach(function () {
    scope = getControllerScope();
    return $rootScope.$digest();
  });

  it('should define code currency dictionary', () => {
    expect(ctrl.human).toBeDefined();
  });

  describe('ctrl.onStep', () => {
    it('should check if on specific step', () => {
      ctrl.step = 1;
      expect(ctrl.onStep('confirm')).toBe(true);
      expect(ctrl.onStep('receipt')).toBe(false);
    });
  });

  describe('ctrl.openTradeDetails', () => {
    it('should open trade details modal', () => {
      spyOn(modals, 'openShiftTradeDetails');
      ctrl.openTradeDetails(mockTrade);
      expect(modals.openShiftTradeDetails).toHaveBeenCalledWith(mockTrade);
    });
  });
});
