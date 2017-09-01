angular
  .module('walletApp')
  .controller('PriceChartController', PriceChartController);

function PriceChartController ($scope, MyBlockchainApi, Wallet, currency) {
  $scope.BTCCurrency = currency.bitCurrencies.filter(c => c.code === 'BTC')[0];

  MyBlockchainApi.getBtcChartData().then(res => {
    console.log('res', res.values);
    $scope.options = {};

    $scope.options.data = res.values.map(data => data.y);
    let date = new Date(res.values[0]['x'] * 1000);
    $scope.options.start = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    $scope.options.interval = 24 * 3600 * 1000; // 1 day
  });
}
