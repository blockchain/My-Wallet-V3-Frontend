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
  const BCHSTART = 1500854400;
  const startMap = { 'btc': BTCSTART, 'eth': ETHSTART, 'bch': BCHSTART };

  $scope.BTCCurrency = currency.bitCurrencies.filter(c => c.code === 'BTC')[0];
  $scope.cachedState = localStorageService.get('chart');
  $scope.settings = Wallet.settings;
  $scope.dateFormat = 'd MMMM yyyy, ' + 'HH:mm';
  $scope.dateFormat = $scope.$root.size.xs ? 'MMM d' : $scope.dateFormat;

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
  $scope.setStart = start => $scope.state.start = start;

  $scope.isTime = time => $scope.state.time === time;
  $scope.isCurrency = curr => $scope.state.base === curr;

  $scope.handleChart = (chartData) => {
    if (!chartData.length) {
      $scope.handleNoData();
      return;
    }

    let fiatCurrency = Wallet.settings.currency.code;
    let fiatSymbol = currency.conversions[fiatCurrency]['symbol'];
    let date = new Date(chartData[0]['timestamp'] * 1000);

    $scope.options = {
      title: { text: null },
      chart: { height: 230 },
      yAxis: {
        title: {
          text: null
        },
        labels: {
          formatter: function () {
            return fiatSymbol + this.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          }
        },
        lineWidth: 1,
        gridLineWidth: 0
      },
      xAxis: {
        type: 'datetime',
        tickWidth: 0,
        labels: {
          style: {
            color: 'gray'
          }
        }
      },
      plotOptions: {
        series: {
          color: '#10ADE4'
        },
        line: {
          marker: {
            enabled: false
          }
        }
      },
      tooltip: {
        pointFormat: fiatSymbol + '{point.y}'
      },
      credits: { enabled: false },
      legend: { enabled: false },
      series: [
        {
          name: 'Price',
          data: chartData.map(data => parseFloat(data.price)),
          pointStart: Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()),
          pointInterval: $scope.timeHelpers[$scope.state.time]['interval']
        }
      ]
    };

    $scope.options.timeFetched = Date.now();
    $scope.options.state = $scope.state;

    localStorageService.set('chart', $scope.state);
    localStorageService.set('chart-data', $scope.options);
    $scope.useCache = false;
    $scope.noData = false;
  };

  $scope.getCachedData = () => $scope.options = localStorageService.get('chart-data');

  $scope.handleNoData = () => {
    $scope.getCachedData();
    $scope.noData = true;
  };

  const handleChartError = () => {
    $scope.getCachedData();
    $scope.useCache = true;
  };

  const fetchChart = options => MyBlockchainApi.getPriceChartData(options).then($scope.handleChart, handleChartError);

  $scope.getStartDate = () => {
    let base = $scope.state.base;
    let d = new Date();
    let start;

    switch ($scope.state.time) {
      case '1month':
        start = d.setMonth(d.getMonth() - 1) / 1000 | 0;
        break;
      case '1week':
        start = d.setDate(d.getDate() - 7) / 1000 | 0;
        break;
      case '1day':
        start = d.setDate(d.getDate() - 1) / 1000 | 0;
        break;
      case '1year':
        start = d.setFullYear(d.getFullYear() - 1) / 1000 | 0;
        break;
      case 'all':
        start = startMap[base];
        break;
    }

    return start >= startMap[base] ? start : startMap[base];
  };

  $scope.$watch('settings.currency', next => $scope.state.quote = next.code);

  $scope.$watch('state.time', next => {
    $scope.setStart($scope.getStartDate());
    $scope.setScale(next);
    fetchChart($scope.state);
  });

  $scope.$watch('state.base', next => {
    $scope.setStart($scope.getStartDate());
    fetchChart($scope.state);
  });
}
