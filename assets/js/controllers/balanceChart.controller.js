angular
  .module('walletApp')
  .controller('BalanceChartController', BalanceChartController);

function BalanceChartController ($scope, $state, Wallet, currency) {
  let routes = { 'Bitcoin': 'btc', 'Ether': 'eth', 'Bitcoin Cash': 'bch' };

  $scope.chart = null;
  $scope.state = { ethBalance: 500, btcBalance: 100, bchBalance: 100 };

  $scope.options = {
    chart: {
      height: 230
    },
    title: {
      text: '$1000.00',
      align: 'center',
      verticalAlign: 'middle'
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        dataLabels: { enabled: false },
        events: {
          click: (evt) => $state.go('wallet.common.' + routes[evt.point.name])
        }
      },
      line: {
        marker: {
          enabled: false
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
        data: [
          {
            y: 100,
            id: 'eth',
            name: 'Ether',
            color: '#004a7c'
          },
          {
            y: 200,
            id: 'btc',
            name: 'Bitcoin',
            color: '#10ADE4'
          },
          {
            y: 100,
            id: 'bch',
            name: 'Bitcoin Cash',
            color: '#B2D5E5'
          }
        ]
      }
    ]
  };

  // watch balances and update
}
