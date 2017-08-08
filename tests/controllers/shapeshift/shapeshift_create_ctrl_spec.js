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

  describe('onComplete', () => {
    it('should go to confirm step', () => {
      spyOn(scope.vm, 'goTo');
      scope.onComplete();
      expect(scope.vm.goTo).toHaveBeenCalledWith('confirm');
    });
  });

});
