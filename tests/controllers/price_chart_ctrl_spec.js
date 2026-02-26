describe('PriceChartController', () => {
  let $rootScope;
  let $controller;
  let $compile;
  let $templateCache;
  let scope;
  let Wallet;
  let $q;
  
  let chartData = [
    {price: 11.916552130375024, volume: 7478080, timestamp: 1473724800},
    {price: 11.943451796583545, volume: 11704300, timestamp: 1473811200},
    {price: 11.926920062695926, volume: 5694820, timestamp: 1473897600},
    {price: 11.917600786627334, volume: 7309090, timestamp: 1473984000}
  ];

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$controller_, _$compile_, _$q_, _$templateCache_, $httpBackend) {
      // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();

      $rootScope = _$rootScope_;
      $controller = _$controller_;
      $compile = _$compile_;
      $templateCache = _$templateCache_;
      $q = _$q_;

      Wallet = $injector.get('Wallet');
      MyBlockchainApi = $injector.get('MyBlockchainApi');

      Wallet.settings = {
        currency: { code: 'USD' }
      }
      
      MyBlockchainApi.getPriceChartData = () => $q.resolve(chartData);

      let currency = $injector.get('currency');
      return currency.conversions['USD'] = { conversion: 2 }; }));

  let getControllerScope = function () {
    scope = $rootScope.$new();
    scope.settings = {
      currency: {
        code: 'USD'
      }
    };

    let template = $templateCache.get('partials/home.pug');
    $controller('PriceChartController', {
      $scope: scope
    }
    );
    $compile(template)(scope);
    return scope;
  };

  it('setCurrency() should update state.base', () => {
    scope = getControllerScope();
    scope.setCurrency('eth');
    expect(scope.state.base).toBe('eth');
  });

  it('setTime() should update state.time', () => {
    scope = getControllerScope();
    scope.setTime('1week');
    expect(scope.state.time).toBe('1week');
  });

  it('setScale() should update state.scale', () => {
    scope = getControllerScope();
    scope.setScale('1week');
    expect(scope.state.scale).toBe(3600);
  });

  it('isTime() should check state.time', () => {
    scope = getControllerScope();
    scope.state.time = '1month';
    expect(scope.isTime('1month')).toBe(true);
  });

  it('isCurrency() should check state.base', () => {
    scope = getControllerScope();
    expect(scope.isCurrency('btc')).toBe(true);
  });

  describe('getStartDate()', () => {
    it('should return the right date', () => {
      scope = getControllerScope();

      scope.state.time = 'all';
      expect(scope.getStartDate()).toBe(1282089600);

      scope.state.time = 'all';
      scope.state.base = 'eth';
      expect(scope.getStartDate()).toBe(1438992000);

      scope.state.time = '1month';
      let d = new Date();
      let result = d.setMonth(d.getMonth() - 1) / 1000 | 0;
      expect(scope.getStartDate()).toBe(result);

      scope.state.time = '1week';
      d = new Date();
      result = d.setDate(d.getDate() - 7) / 1000 | 0;
      expect(scope.getStartDate()).toBe(result);

      scope.state.time = '1day';
      d = new Date();
      result = d.setDate(d.getDate() - 1) / 1000 | 0;
      expect(scope.getStartDate()).toBe(result);

      scope.state.time = '1year';
      d = new Date();
      result = d.setFullYear(d.getFullYear() - 1) / 1000 | 0;
      expect(scope.getStartDate()).toBe(result);
    });
  });

  describe('handleChart()', () => {
    it('should extract the price data', () => {
      scope = getControllerScope();
      scope.handleChart(chartData);
      expect(scope.options.series[0].data[0]).toBe(parseFloat(chartData[0].price));
    });

    it('should set the interval', () => {
      scope = getControllerScope();
      scope.state.time = '1day';
      scope.handleChart(chartData);
      expect(scope.options.series[0].pointInterval).toBe((3600 * 1000) / 4);
    });
  });
});
