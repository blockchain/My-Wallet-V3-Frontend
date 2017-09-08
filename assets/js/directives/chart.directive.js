angular
  .module('walletDirectives')
  .directive('chart', chart);

chart.$inject = ['Wallet', 'currency', '$timeout'];

function chart (Wallet, currency, $timeout) {
  const directive = {
    restrict: 'E',
    scope: {
      options: '='
    },
    templateUrl: 'templates/chart.pug',
    link
  };

  return directive;

  function link (scope, elem, attrs) {
    scope.currency = Wallet.settings.currency.code;
    scope.symbol = currency.conversions[scope.currency]['symbol'];
    scope.width = elem[0].clientWidth;

    Highcharts.setOptions({
      lang: {
        thousandsSep: ','
      }
    });
    let chart = Highcharts.chart('chart', {
      chart: {
        height: 300
      },
      title: {
        text: null
      },
      yAxis: {
        title: {
          text: null
        },
        labels: {
          formatter: function () {
            return scope.symbol + this.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
        pointFormat: '{series.name}(' + scope.currency + '): {point.y}'
      },
      credits: {
        enabled: false
      },
      legend: {
        enabled: false
      },

      series: [
        {
          name: 'Price',
          data: scope.options.data,
          pointStart: Date.UTC(scope.options.year, scope.options.month, scope.options.day, scope.options.hour),
          pointInterval: scope.options.interval
        }
      ]
    });

    scope.$watch('options', o => {
      chart.update({
        series: [
          {
            name: 'Price',
            data: o.data,
            pointStart: Date.UTC(scope.options.year, scope.options.month, scope.options.day, scope.options.hour),
            pointInterval: scope.options.interval
          }
        ]
      });
    });
  }
}
