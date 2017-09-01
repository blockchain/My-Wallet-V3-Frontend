angular
  .module('walletDirectives')
  .directive('chart', chart);

chart.$inject = ['Wallet'];

function chart ($timeout, Wallet) {
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
    console.log('chart directive', scope.options, Highcharts);
    Highcharts.chart('chart', {
      title: {
        text: null
      },
      yAxis: {
        title: {
          text: null
        }
      },
      xAxis: {
        type: 'datetime',
        tickWidth: 0
      },
      plotOptions: {
        series: {
          pointStart: scope.options.start,
          pointInterval: scope.options.interval
        }
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
          data: scope.options.data
        }
      ]
    });

    scope.$watch('options', o => {
      console.log('watching options', o);
    });
  }
}
