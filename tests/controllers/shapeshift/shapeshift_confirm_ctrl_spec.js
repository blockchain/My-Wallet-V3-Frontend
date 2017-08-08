describe('ShapeShiftConfirmController', () => {
  let scope;
  let ShapeShift;
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
      ShapeShift = $injector.get('ShapeShift');
      ShapeShift.watchTradeForCompletion = () => $q.resolve();
    })
  );

  let getControllerScope = function (params) {
    if (params == null) { params = {}; }
    scope = $rootScope.$new();
    scope.vm = {
      goTo: (step) => { scope.vm.step = step; }
    };
    $controller('ShapeShiftConfirmController',
      {$scope: scope});
    return scope;
  };

  beforeEach(function () {
    scope = getControllerScope();
    return $rootScope.$digest();
  });

  it('should define shiftHandler', () => {
    expect(scope.shiftHandler).toBeDefined();
  });

  describe('onComplete', () => {
    it('should go to receipt step', () => {
      spyOn(scope.vm, 'goTo');
      scope.onComplete(7);
      expect(scope.vm.goTo).toHaveBeenCalledWith('receipt');
    });
    it('should set fee', () => {
      scope.onComplete(7);
      expect(scope.vm.trade).toEqual(7);
    });
    it('should watch trade for completion', () => {
      spyOn(ShapeShift, 'watchTradeForCompletion').and.callFake(function () {
        var deferred = $q.defer();
        deferred.resolve('Remote call result');
        return deferred.promise;
      });
      scope.onComplete();
      expect(ShapeShift.watchTradeForCompletion).toHaveBeenCalled();
    });
  });

  describe('onCancel', () => {
    it('should cancel modal', () => {
      spyOn(Alerts, 'surveyCloseConfirm').and.callFake(function () {
        var deferred = $q.defer();
        deferred.resolve('Remote call result');
        return deferred.promise;
      });
      scope.onCancel();
      expect(Alerts.surveyCloseConfirm).toHaveBeenCalled();
    });
  });
});
