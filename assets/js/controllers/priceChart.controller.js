angular
  .module('walletApp')
  .controller('PriceChartController', PriceChartController);

function PriceChartController ($scope, MyBlockchainApi, Wallet, currency, localStorageService, $timeout) {
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

  let hasBeenLessThan15Minutes = time => {
    if (!time) return false;
    let fetched = new Date(time);
    let now = new Date();

    let minutes = (now - fetched) / 60000;
    return minutes < 15;
  };

  $scope.$watchGroup(['state.currency', 'state.time'], (next, prev) => {
    let cachedChart = localStorageService.get('chart');
    /*
    simulate the delay of an http request so
    the chart fully fills its parent container when it is drawn
    */
    if (next[1] === cachedChart.state.time && hasBeenLessThan15Minutes(cachedChart.timeFetched)) {
      $scope.options = null;
      $timeout(() => {
        $scope.options = cachedChart;
      }, 50);
    } else {
      fetchChart(next[1]);
    }
  });
}
