angular
  .module('walletApp')
  .controller('PriceChartController', PriceChartController);

function PriceChartController ($scope, MyBlockchainApi, Wallet, currency, localStorageService, $timeout) {
  // scale in seconds
  const FIFTEENMIN = 15 * 60;
  const HOUR = 60 * 60;
  const TWOHOUR = 2 * 60 * 60;
  const DAY = 24 * 60 * 60;
  const FIVEDAY = 5 * 24 * 60 * 60;
  const BTCSTART = 1282089600;
  const ETHSTART = 1438992000;

  $scope.BTCCurrency = currency.bitCurrencies.filter(c => c.code === 'BTC')[0];
  $scope.cachedState = localStorageService.get('chart').state;
  $scope.settings = Wallet.settings;

  const getInitialStartTime = () => {
    let d = new Date();
    return d.setMonth(d.getMonth() - 1) / 1000 | 0;
  };

  $scope.state = $scope.cachedState || {
    base: 'btc',
    quote: $scope.settings.currency.code,
    time: '1month',
    start: getInitialStartTime(),
    scale: TWOHOUR
  };

  const intervals = {
    day: 24 * 3600 * 1000,
    hour: 3600 * 1000
  };

  $scope.timeHelpers = {
    'all': { interval: intervals.day * 5, scale: FIVEDAY },
    '1year': { interval: intervals.day, scale: DAY },
    '1month': { interval: intervals.day / 12, scale: TWOHOUR },
    '1week': { interval: intervals.day / 24, scale: HOUR },
    '1day': { interval: intervals.hour / 4, scale: FIFTEENMIN }
  };

  $scope.setCurrency = curr => $scope.state.base = curr;
  $scope.setTime = time => $scope.state.time = time;
  $scope.setScale = range => $scope.state.scale = $scope.timeHelpers[range]['scale'];

  $scope.isTime = time => $scope.state.time === time;
  $scope.isCurrency = curr => $scope.state.base === curr;

  const handleChart = (chartData) => {
    $scope.options = {};

    $scope.options.data = chartData.map(data => parseFloat(data.price.toFixed(2)));

    let date = new Date(chartData[0]['timestamp'] * 1000);

    $scope.options.year = date.getUTCFullYear();
    $scope.options.month = date.getUTCMonth();
    $scope.options.day = date.getUTCDate();
    $scope.options.hour = date.getUTCHours();
    $scope.options.interval = $scope.timeHelpers[$scope.state.time]['interval'];

    $scope.options.timeFetched = Date.now();
    $scope.options.state = $scope.state;

    localStorageService.set('chart', $scope.options);
  };

  const fetchChart = options => MyBlockchainApi.getPriceChartData(options).then(handleChart);

  // let hasBeenLessThan15Minutes = time => {
  //   if (!time) return false;
  //   let fetched = new Date(time);
  //   let now = new Date();
  //
  //   let minutes = (now - fetched) / 60000;
  //   return minutes < 15;
  // };

  $scope.getStartDate = () => {
    let d = new Date();

    switch ($scope.state.time) {
      case '1month':
        return d.setMonth(d.getMonth() - 1) / 1000 | 0;
      case '1week':
        return d.setDate(d.getDate() - 7) / 1000 | 0;
      case '1day':
        return d.setDate(d.getDate() - 1) / 1000 | 0;
      case '1year':
        return d.setFullYear(d.getFullYear() - 1) / 1000 | 0;
      case 'all':
        if ($scope.state.base === 'btc') return BTCSTART;
        if ($scope.state.base === 'eth') return ETHSTART;
    }
  };

  $scope.mapStateToReq = time => {
    let startDate = $scope.getStartDate();
    $scope.state.start = startDate;

    return Object.assign({}, $scope.state, $scope.timeHelpers[time], {start: startDate});
  };

  $scope.$watch('state.base', next => fetchChart($scope.state));

  $scope.$watch('state.time', next => {
    $scope.setScale(next);
    fetchChart($scope.mapStateToReq(next));
  });
}
