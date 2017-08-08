describe('ShapeShiftCreateController', () => {
  let scope;
  let $rootScope;
  let $controller;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$controller_, _$q_, _$timeout_, $httpBackend) {
      // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();

      $rootScope = _$rootScope_;
      $controller = _$controller_;
    })
  );

  let getControllerScope = function (params) {
    if (params == null) { params = {}; }
    scope = $rootScope.$new();
    scope.vm = {
      goTo: (step) => { scope.vm.step = step; }
    };
    $controller('ShapeShiftCreateController',
      {$scope: scope});
    return scope;
  };

  beforeEach(function () {
    scope = getControllerScope();
    return $rootScope.$digest();
  });

  it('should set quote handler', () => {
    expect(scope.quoteHandler).toBeDefined();
  });

  it('should set approximate quote handler', () => {
    expect(scope.approximateQuoteHandler).toBeDefined();
  });

  describe('onComplete', () => {
    it('should go to confirm step', () => {
      spyOn(scope.vm, 'goTo');
      scope.onComplete();
      expect(scope.vm.goTo).toHaveBeenCalledWith('confirm');
    });
    it('should set fee', () => {
      scope.onComplete(1, 2, 3);
      expect(scope.vm.fee).toEqual(2);
    });
    it('should set quote', () => {
      scope.onComplete(1, 2, 3);
      expect(scope.vm.quote).toEqual(3);
    });
    it('should set payment', () => {
      scope.onComplete(1, 2, 3);
      expect(scope.vm.payment).toEqual(1);
    });
  });
});
