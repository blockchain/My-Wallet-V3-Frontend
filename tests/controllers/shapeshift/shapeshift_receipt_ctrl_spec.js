describe('ShapeShiftReceiptController', () => {
  let scope;
  let Alerts;
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

      Alerts = $injector.get('Alerts');
      Alerts.surveyCloseConfirm = () => $q.resolve();
    })
  );

  let getControllerScope = function (params) {
    if (params == null) { params = {}; }
    scope = $rootScope.$new();
    scope.vm = {
      goTo: (step) => { scope.vm.step = step; },
      trade: 'a b c'
    };
    $controller('ShapeShiftReceiptController',
      {$scope: scope, Env: $q.resolve({shapeshift: { surveyLinks: {} }})});
    return scope;
  };

  beforeEach(function () {
    scope = getControllerScope();
    return $rootScope.$digest();
  });

  it('should define trade', () => {
    expect(scope.trade).toEqual('a b c');
  });

  describe('onClose', () => {
    it('should close modal', () => {
      spyOn(Alerts, 'surveyCloseConfirm').and.callFake(function () {
        var deferred = $q.defer();
        deferred.resolve('Remote call result');
        return deferred.promise;
      });
      scope.onClose();
      expect(Alerts.surveyCloseConfirm).toHaveBeenCalled();
    });
    it('should go to create after close', () => {
      spyOn(scope.vm, 'goTo');
      scope.onClose();
      scope.$digest();
      expect(scope.vm.goTo).toHaveBeenCalledWith('create');
    });
  });
});
