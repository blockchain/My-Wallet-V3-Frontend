describe('shift-confirm.component', () => {
  let $rootScope;
  let $compile;
  let $templateCache;
  let $componentController;
  let $q;
  let scope;

  let mockQuote = () =>
    ({
      depositAddress: '16QBM4CxQAfyaX9mJw1iNmW9XCfWyexkHV',
      depositAmount: '1',
      fromCurrency: 'btc',
      toCurrency: 'eth',
      minerFee: '0.005',
      expires: 1000,
      rate: '11'
    });

  let mockPayment = () =>
  ({
    quote: mockQuote(),
    payment: () => { return $q.resolve(); }
  });

  let handlers = {
    handleShift () { return $q.resolve(mockPayment()); },
    onComplete () { return $q.resolve(); },
    onCancel () { return $q.resolve(); },
    payment () { return mockPayment(); },
    quote () { return mockQuote(); },
    fee: 0.0002
  };

  let getControllerScope = function (bindings) {
    scope = $rootScope.$new(true);
    $componentController('shiftConfirm', {$scope: scope}, bindings);
    let template = $templateCache.get('templates/shapeshift/confirm.pug');
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

  describe('.shift()', () => {
    beforeEach(function () {
      scope = getControllerScope(handlers);
    });

    it('should lock the scope while generating shift', () => {
      scope.shift();
      expect(scope.locked).toEqual(true);
      scope.$digest();
      expect(scope.locked).toEqual(false);
    });
  });

  describe('.onExpiration()', () => {
    beforeEach(function () {
      scope = getControllerScope(handlers);
    });

    it('should lock the scope', () => {
      scope.onExpiration();
      expect(scope.locked).toEqual(true);
    });
  });

  describe('.getTimeToExpiration()', () => {
    beforeEach(function () {
      scope = getControllerScope(handlers);
      scope.quote = mockQuote();
    });

    it('should have an expiration time', () => {
      expect(scope.getTimeToExpiration()).toBeDefined();
    });
  });
});
