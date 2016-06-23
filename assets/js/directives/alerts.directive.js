angular
  .module('walletApp')
  .directive('alerts', alerts);

function alerts (Alerts) {
  const directive = {
    restrict: 'E',
    scope: {
      alertsContext: '=context'
    },
    template: `
      <uib-alert ng-repeat="alert in alerts" type="{{::alert.type}}" close="alert.close()">
        {{::alert.msg}}
      </uib-alert>
    `,
    link: link
  };
  return directive;

  function link (scope) {
    scope.alerts = Array.isArray(scope.alertsContext)
      ? scope.alertsContext : Alerts.alerts;
  }
}
