angular
  .module('walletDirectives')
  .directive('chart', chart);

chart.$inject = ['Wallet', 'currency'];

function chart ($timeout, Wallet, currency) {
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
    console.log('chart directive', scope.options);

    Highcharts.setOptions({
      lang: {
        thousandsSep: ','
      }
    });

    let chart = Highcharts.chart('chart', {
      title: {
        text: null
      },
      yAxis: {
        title: {
          text: null
        },
        labels: {
          formatter: function () {
            return '$' + this.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          }
        },
        lineWidth: 1
      },
      xAxis: {
        type: 'datetime',
        tickWidth: 0,
        labels: {
          rotation: 65,
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
        pointFormat: '{series.name}: ${point.y}'
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
          pointStart: Date.UTC(scope.options.year, scope.options.month, scope.options.day),
          pointInterval: scope.options.interval
        }
      ]
    });

    scope.$watch('options', o => {
      console.log('watching options', o);
      chart.update({
        series: [
          {
            name: 'Price',
            data: o.data,
            pointStart: Date.UTC(scope.options.year, scope.options.month, scope.options.day),
            pointInterval: scope.options.interval
          }
        ]
      });
    });
  }
}
