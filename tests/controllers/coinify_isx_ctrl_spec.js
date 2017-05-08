describe('CoinifyISXController', () => {
  let scope;
  let $rootScope;
  let $controller;
  
  let trade = {
    medium: 'bank',
    inCurrency: 'USD',
    outCurrency: 'BTC',
    state: 'processing'
  };

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$controller_, _$q_, _$timeout_) {
      $rootScope = _$rootScope_;
      return $controller = _$controller_;
    })
  );

  let getControllerScope = function (params) {
    if (params == null) { params = {}; }
    scope = $rootScope.$new();
    scope.vm = {
      trade,
      goTo(state) {}
    };

    $controller("CoinifyISXController",
      {$scope: scope});
    return scope;
  };

  beforeEach(function () {
    scope = getControllerScope();
    return $rootScope.$digest();
  });

  describe("state", () =>

    it("should have a trade", () => expect(scope.vm.trade).toBeDefined())
  );
  
  describe(".onComplete()", () =>
    
    it('should handle an onComplete event', () => {
      spyOn(scope.vm, 'goTo');
      scope.onComplete('processing');
      expect(scope.vm.completedState).toBe('processing');
      expect(scope.vm.goTo).toHaveBeenCalledWith('trade-complete');
    })
  );
});
