describe('shift-receipt.component', () => {
  let $rootScope;
  let $compile;
  let $templateCache;
  let $componentController;
  let $q;
  let scope;

  let mockTrade = () =>
    ({
      pair: 'btc_eth',
      status: 'no_deposits'
    });

  let handlers = {
    shift: mockTrade(),
    onClose () { return $q.resolve(); },
    isCheckout () { return true; }
  };

  let getControllerScope = function (bindings) {
    scope = $rootScope.$new(true);
    $componentController('shiftReceipt', {$scope: scope}, bindings);
    let template = $templateCache.get('templates/shapeshift/receipt.pug');
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

      $q = $injector.get('$q');
    }));

  describe('initial state', () => {
    beforeEach(function () {
      scope = getControllerScope(handlers);
    });

    it('should define trade', () => {
      expect(scope.trade).toBeDefined();
    });
  });
});
