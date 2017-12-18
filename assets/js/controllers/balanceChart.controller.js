angular
  .module('walletApp')
  .controller('BalanceChartController', BalanceChartController);

function BalanceChartController ($scope, $state, Wallet, currency) {
  $scope.conversions = currency.conversions;
  $scope.ethConversions = currency.ethConversions;
  $scope.bchConversions = currency.bchConversions;

  let fiat = Wallet.settings.currency;
  let cryptoMap = currency.cryptoCurrencyMap;

  let total = () => (fiatOf('btc') + fiatOf('eth') + fiatOf('bch')).toFixed(2);
  let fiatOf = (curr) => {
    let amt = cryptoMap[curr].from($scope[curr].total(), fiat) || 0;
    return parseFloat((Math.floor(amt * 100) / 100).toFixed(2));
  };

  $scope.handleChart = () => {
    let symbol = currency.conversions[fiat.code].symbol;

    $scope.options = {
      chart: {
        height: 230
      },
      tooltip: {
        enabled: total() > 0,
        pointFormat: symbol + '{point.y}'
      },
      title: {
        y: 5,
        align: 'center',
        verticalAlign: 'middle',
        text: symbol + currency.commaSeparate(total())
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          animation: { duration: 0 },
          dataLabels: { enabled: false },
          events: {
            click: (evt) => total() > 0 && $state.go('wallet.common.' + evt.point.id + '.transactions')
          }
        },
        line: {
          marker: {
            enabled: false
          }
        },
        series: {
          states: {
            hover: {
              enabled: total() > 0
            }
          }
        }
      },
      credits: { enabled: false },
      series: [
        {
          type: 'pie',
          name: 'Amount',
          innerSize: '70%',
          cursor: 'pointer',
          data: total() > 0 ? [
            {
              y: fiatOf('eth'),
              id: 'eth',
              name: 'Ether',
              color: '#10ADE4'
            },
            {
              y: fiatOf('btc'),
              id: 'btc',
              name: 'Bitcoin',
              color: '#004a7c'
            },
            {
              y: fiatOf('bch'),
              id: 'bch',
              name: 'Bitcoin Cash',
              color: '#B2D5E5'
            }
          ] : [
            {
              y: 1,
              id: null,
              name: '',
              color: '#dddddd'
            }
          ]
        }
      ]
    };
  };

  $scope.$watchGroup(['btc.total()', 'eth.total()', 'bch.total()'], $scope.handleChart);
  $scope.$watchCollection('conversions', () => $scope.handleChart());
  $scope.$watchCollection('ethConversions', () => $scope.handleChart());
  $scope.$watchCollection('bchConversions', () => $scope.handleChart());
}
