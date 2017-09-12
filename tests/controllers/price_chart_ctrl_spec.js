fdescribe('PriceChartController', () => {
  let $rootScope;
  let $controller;
  let $compile;
  let $templateCache;
  let scope;
  let Wallet;
  let currency;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$controller_, _$compile_, _$templateCache_, $httpBackend) {
      // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();

      $rootScope = _$rootScope_;
      $controller = _$controller_;
      $compile = _$compile_;
      $templateCache = _$templateCache_;

      Wallet = $injector.get('Wallet');

      Wallet.settings = {
        currency: { code: 'USD' }
      }

      let currency = $injector.get('currency');
      return currency.conversions['USD'] = { conversion: 2 }; }));

  let chartData = [
    {price: 11.916552130375024, volume: 7478080, timestamp: 1473724800},
    {price: 11.943451796583545, volume: 11704300, timestamp: 1473811200},
    {price: 11.926920062695926, volume: 5694820, timestamp: 1473897600},
    {price: 11.917600786627334, volume: 7309090, timestamp: 1473984000},
    {price: 12.556429902671361, volume: 17421500, timestamp: 1474070400},
    {price: 12.6732465350693, volume: 7446610, timestamp: 1474156800},
    {price: 12.469936384157604, volume: 22433300, timestamp: 1474243200},
    {price: 13.206035605731653, volume: 13838800, timestamp: 1474329600},
    {price: 14.388928486576383, volume: 31929100, timestamp: 1474416000},
    {price: 13.759426324311823, volume: 28645000, timestamp: 1474502400},
    {price: 13.238254286350479, volume: 27382800, timestamp: 1474588800},
    {price: 13.419736548336683, volume: 9166430, timestamp: 1474675200},
    {price: 12.863909129875697, volume: 9824880, timestamp: 1474761600},
    {price: 13.072552447552448, volume: 5283440, timestamp: 1474848000},
    {price: 12.906090289608178, volume: 7213070, timestamp: 1474934400},
    {price: 13.116268980477223, volume: 6831070, timestamp: 1475020800},
    {price: 13.271607653397846, volume: 10239000, timestamp: 1475107200},
    {price: 13.094825719852784, volume: 5990630, timestamp: 1475193600},
    {price: 13.28983606557377, volume: 5950840, timestamp: 1475280000},
    {price: 13.192117165625673, volume: 6331160, timestamp: 1475366400},
    {price: 13.17522200563136, volume: 4079660, timestamp: 1475452800}
  ];

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
      expect(scope.options.data[0]).toBe(parseFloat(chartData[0].price.toFixed(2)));
    });

    it('should get UTC dates', () => {
      scope = getControllerScope();
      scope.handleChart(chartData);
      let d = new Date(chartData[0].timestamp * 1000);
      expect(scope.options.year).toBe(d.getUTCFullYear());
      expect(scope.options.month).toBe(d.getUTCMonth());
      expect(scope.options.day).toBe(d.getUTCDate());
      expect(scope.options.hour).toBe(d.getUTCHours());
    });

    it('should set the interval', () => {
      scope = getControllerScope();
      scope.state.time = '1day';
      scope.handleChart(chartData);
      expect(scope.options.interval).toBe((3600 * 1000) / 4);
    });
  });

  describe('mapStateToReq()', () => {
    it('should return an object', () => {
      scope = getControllerScope();
      expect(scope.mapStateToReq('1week')).toEqual(jasmine.any(Object));
    });
  });
});
