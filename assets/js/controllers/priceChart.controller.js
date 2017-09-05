angular
  .module('walletApp')
  .controller('PriceChartController', PriceChartController);

function PriceChartController ($scope, MyBlockchainApi, Wallet, currency) {
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
  };

  const fetchChart = (time) => {
    MyBlockchainApi.getBtcChartData(time).then(handleChart);
  };
  fetchChart($scope.state.time);

  $scope.$watchGroup(['state.currency', 'state.time'], (next, prev) => {
    fetchChart(next[1]);
  });
}
