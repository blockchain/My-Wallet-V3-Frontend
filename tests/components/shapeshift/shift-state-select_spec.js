describe('shift-state-select.component', () => {
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
    shift () { return mockTrade(); },
    email: 'satoshi@gmail.com'
  };

  let getControllerScope = function (bindings) {
    scope = $rootScope.$new(true);
    $componentController('shiftStateSelect', {$scope: scope}, bindings);
    let template = $templateCache.get('templates/shapeshift/state-select.pug');
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

  describe('onStateWhitelist', () => {
    beforeEach(function () {
      scope = getControllerScope(handlers);
      scope.$ctrl.state = {Code: 'NY'};
      scope.$ctrl.whitelisted = ['NY', 'CA', 'TX'];
    });

    it('should return true if state is on whitelist', () => {
      expect(scope.$ctrl.onStateWhitelist()).toBe(true);
    });
  });

  describe('signupForShift', () => {
    it('should call signupForShift with email and state', () => {
      scope = getControllerScope(handlers);
      scope.$ctrl.state = { Name: 'New York' };
      let state = scope.$ctrl.state.Name;
      let email = encodeURIComponent(scope.$ctrl.email);
      scope.$ctrl.signupForShift(state, email);
      expect(email).toBe('satoshi%40gmail.com');
    });
  });
});
