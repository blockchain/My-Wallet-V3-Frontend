
function RoutesConfig ($routeProvider) {
  $routeProvider
    .when('/', {
      controller: 'MainController',
      template: ''
    })
    .when('/key/:apiKey/env/:env', {
      controller: 'PlaidController',
      template: '<button ng-if="!hideButton" ng-click="enablePlaid()" class="btn button-primary full">Sign into Bank Account</button>'
    })
    .otherwise({
      redirectTo: '/'
    });
}

export default RoutesConfig;
