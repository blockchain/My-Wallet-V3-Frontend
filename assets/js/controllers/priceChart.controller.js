angular
  .module('walletApp')
  .controller('PriceChartController', PriceChartController);

function PriceChartController ($scope, MyBlockchainApi, Wallet, currency, localStorageService, $timeout) {
  const DAY = 24 * 3600 * 1000;
  const HOUR = 3600 * 1000;

  $scope.BTCCurrency = currency.bitCurrencies.filter(c => c.code === 'BTC')[0];

  $scope.settings = Wallet.settings;

  const getInitialStartTime = () => {
    let d = new Date();
    return d.setMonth(d.getMonth() - 1) / 1000 | 0;
  };

  $scope.state = {
    base: 'btc',
    quote: $scope.settings.currency.code,
    time: '1month',
    start: getInitialStartTime(),
    scale: 'HOUR',
    scalen: 8
  };

  $scope.timeHelpers = {
    'all': { interval: DAY * 4, scalen: 4, scale: 'DAY' },
    '1year': { interval: DAY, scalen: 1, scale: 'DAY' },
    '1month': { interval: DAY / 3, scalen: 8, scale: 'HOUR' },
    '1week': { interval: DAY / 8, scalen: 3, scale: 'HOUR' },
    '1day': { interval: HOUR / 4, scalen: 15, scale: 'MIN' }
  };

  $scope.setCurrency = curr => $scope.state.base = curr;
  $scope.setTime = time => $scope.state.time = time;

  $scope.isTime = time => $scope.state.time === time;
  $scope.isCurrency = curr => $scope.state.base === curr;

  const handleChart = (chartData) => {
    $scope.options = {};

    $scope.options.data = chartData.map(data => parseFloat(data.price.toFixed(2)));

    let date = new Date(chartData[0]['timestamp'] * 1000);

    $scope.options.year = date.getUTCFullYear();
    $scope.options.month = date.getUTCMonth();
    $scope.options.day = date.getUTCDate();
    $scope.options.interval = $scope.timeHelpers[$scope.state.time]['interval'];

    $scope.options.timeFetched = Date.now();
    $scope.options.state = $scope.state;

    // localStorageService.set('chart', $scope.options);
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
      default:
    }
  };

  $scope.mapStateToReq = time => {
    let startDate = $scope.getStartDate();
    $scope.state.start = startDate;

    return Object.assign({}, $scope.state, $scope.timeHelpers[time], {start: startDate});
  };

  $scope.$watch('state.base', next => fetchChart($scope.state));

  $scope.$watch('state.time', next => {
    $scope.state.scale = $scope.timeHelpers[next]['scale'];
    $scope.state.scalen = $scope.timeHelpers[next]['scalen'];
    fetchChart($scope.mapStateToReq(next));
  });
}
