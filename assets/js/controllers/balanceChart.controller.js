angular
  .module('walletApp')
  .controller('BalanceChartController', BalanceChartController);

function BalanceChartController ($scope, $state, Wallet, currency) {
  let fiat = Wallet.settings.currency;
  let cryptoMap = currency.cryptoCurrencyMap;

  let total = () => (fiatOf('btc') + fiatOf('eth') + fiatOf('bch')).toFixed(2);
  let fiatOf = (currency) => parseFloat((cryptoMap[currency].from($scope[currency].total(), fiat) || 0).toFixed(2));

  $scope.handleChart = () => {
    let symbol = currency.conversions[fiat.code].symbol;

    $scope.options = {
      chart: {
        height: 230
      },
      tooltip: {
        enabled: total() > 0
      },
      title: {
        y: 5,
        align: 'center',
        verticalAlign: 'middle',
        text: symbol + total()
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          dataLabels: { enabled: false },
          events: {
            click: (evt) => total() > 0 && $state.go('wallet.common.' + evt.point.id)
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

  $scope.$watchGroup(['btc.total()', 'eth.total()', 'bch.total'], $scope.handleChart);
}
