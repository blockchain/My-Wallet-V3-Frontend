
function RoutesConfig ($routeProvider) {
  $routeProvider
    .when('/', {
      controller: 'MainController',
      template: ''
    })
    .when('/analytics/:analyticsKey/:stateName', {
      controller: 'AnalyticsController',
      template: ''
    })
    .otherwise({
      redirectTo: '/'
    });
}

export default RoutesConfig;
