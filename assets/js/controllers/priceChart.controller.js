angular
  .module('walletApp')
  .controller('PriceChartController', PriceChartController);

function PriceChartController ($scope, MyBlockchainApi, Wallet, currency, localStorageService) {
  const DAY = 24 * 3600 * 1000;

  $scope.BTCCurrency = currency.bitCurrencies.filter(c => c.code === 'BTC')[0];

  $scope.state = {
    currency: 'btc',
    time: '1months'
  };

  $scope.setCurrency = curr => $scope.state.currency = curr;
  $scope.setTime = time => $scope.state.time = time;

  $scope.isTime = time => $scope.state.time === time;
  $scope.isCurrency = curr => $scope.state.currency === curr;

  const handleChart = (chartData) => {
    console.log('handleChart', chartData);
    $scope.options = {};

    $scope.options.data = chartData.values.map(data => data.y);
    let date = new Date(chartData.values[0]['x'] * 1000);

    $scope.options.year = date.getUTCFullYear();
    $scope.options.month = date.getUTCMonth();
    $scope.options.day = date.getUTCDate();
    $scope.options.interval = DAY;

    $scope.options.timeFetched = Date.now();
    $scope.options.state = $scope.state;

    localStorageService.set('chart', $scope.options);
  };

  const fetchChart = (time) => {
    console.log('fetching chart data');
    MyBlockchainApi.getBtcChartData(time).then(handleChart);
  };
  // fetchChart($scope.state.time);

  let hasBeenLessThan15Minutes = time => {
    if (!time) return false;
    let fetched = new Date(time);
    let now = new Date();

    let minutes = (now - fetched) / 60000;
    console.log('hasBeen15Minutes', minutes);
    return minutes < 15;
  };

  $scope.$watchGroup(['state.currency', 'state.time'], (next, prev) => {
    let cachedChart = localStorageService.get('chart');

    if (next[1] === cachedChart.state.time && hasBeenLessThan15Minutes(cachedChart.timeFetched)) {
      $scope.options = cachedChart;
    } else {
      fetchChart(next[1]);
    }
  });
}
