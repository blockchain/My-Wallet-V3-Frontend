
function RoutesConfig ($routeProvider) {
  $routeProvider
    .when('/', {
      controller: 'MainController',
      template: ''
    })
    .when('/key/:apiKey/user/:userId', {
      controller: 'SiftController',
      template: ''
    })
    .when('/key/:apiKey/user/:userId/trade/:tradeId', {
      controller: 'SiftController',
      template: ''
    })
    .otherwise({
      redirectTo: '/'
    });
}

export default RoutesConfig;
