const modules = [
  'ngSanitize',
  'ngRoute'
];

angular.module('plaidApp', modules)
.controller('MainController', function ($scope) {
  console.error('Please pass in the SFOX API key and parent domain');
})
.config(($routeProvider) => {
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
})
.run(() => {
});
