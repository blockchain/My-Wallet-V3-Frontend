
function RoutesConfig ($routeProvider) {
  $routeProvider
    .when('/', {
      controller: 'MainController',
      template: ''
    })
    .when('/key/:apiKey', {
      controller: 'PlaidController',
      template: '<button ng-click="enablePlaid()" class="btn button-primary full">Sign In To Your Bank Account</button>'
    })
    .otherwise({
      redirectTo: '/'
    });
}

export default RoutesConfig;
