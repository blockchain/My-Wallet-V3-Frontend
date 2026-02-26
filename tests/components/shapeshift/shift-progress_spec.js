describe('shift-progress.component', () => {
  let $rootScope;
  let $compile;
  let $templateCache;
  let $componentController;
  let scope;

  let mockTrade = () =>
    ({
      status: 'no_deposits'
    });

  let handlers = {
    shift () { return mockTrade(); }
  };

  let getControllerScope = function (bindings) {
    scope = $rootScope.$new(true);
    $componentController('shiftProgress', {$scope: scope}, bindings);
    let template = $templateCache.get('templates/shapeshift/progress.pug');
    $compile(template)(scope);
    return scope;
  };

  beforeEach(module('walletApp'));
  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$compile_, _$templateCache_, _$componentController_, $httpBackend) {
      // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();

      $rootScope = _$rootScope_;
      $compile = _$compile_;
      $templateCache = _$templateCache_;
      $componentController = _$componentController_;
    }));

  describe('initial state', () => {
    beforeEach(function () {
      scope = getControllerScope(handlers);
    });

    it('should define trade and steps', () => {
      expect(scope.trade).toBeDefined();
      expect(scope.$ctrl.steps).toBeDefined();
    });
  });

  describe('$ctrl.goTo', () => {
    beforeEach(function () {
      scope = getControllerScope(handlers);
    });

    it('should go to step', () => {
      scope.$ctrl.goTo('complete');
      expect(scope.$ctrl.onStep('complete')).toBe(true);
    });
  });

  describe('$watchers', () => {
    beforeEach(function () {
      scope = getControllerScope(handlers);
    });

    it('should go to new status step', () => {
      spyOn(scope.$ctrl, 'goTo');
      scope.trade.status = 'received';
      scope.$digest();
      expect(scope.$ctrl.goTo).toHaveBeenCalledWith('received');
    });
  });
});
