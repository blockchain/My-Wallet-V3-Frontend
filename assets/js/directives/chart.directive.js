angular
  .module('walletDirectives')
  .directive('chart', chart);

chart.$inject = ['Wallet', 'currency', '$timeout'];

function chart (Wallet, currency, $timeout) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      options: '='
    },
    link
  };

  return directive;

  function link (scope, elem, attrs) {
    Highcharts.setOptions({lang: { thousandsSep: ',' }});
    let chart = Highcharts.chart(attrs.id, scope.options);
    scope.$watch('options', options => { $timeout(() => { chart.update(options); chart.reflow(); }, 100); });
  }
}
