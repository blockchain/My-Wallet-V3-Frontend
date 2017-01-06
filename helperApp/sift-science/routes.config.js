
function RoutesConfig ($routeProvider) {
  $routeProvider
    .when('/', {
      controller: 'MainController',
      template: ''
    })
    .when('/key/:apiKey', {
      controller: 'SiftController',
      template: ''
    })
    .otherwise({
      redirectTo: '/'
    });
}

export default RoutesConfig;
