'use strict';
const modules = [
  'ngSanitize',
  'ngRoute'
];

angular.module('plaidApp', modules)
.controller('MainController', function ($scope) {
  console.error('Please pass in the SFOX API key and parent domain');
})
.controller('PlaidController', function ($scope, $routeParams) {
  var isInIframe = (parent !== window);

  if (!isInIframe) {
    console.error('Must be inside iframe');
    return;
  }

  const parentUrl = document.referrer.replace('/wallet/', '');

  var linkHandler = window.Plaid.create({
    product: 'auth',
    env: 'production',
    clientName: 'SFOX',
    key: $routeParams.apiKey,
    onLoad: function () {},
    onExit: function () {
      window.parent.postMessage({from: 'plaid', to: 'exchange', command: 'disablePlaid'}, parentUrl);
    },
    onSuccess: function (public_token, metadata) {
      window.parent.postMessage({from: 'plaid', to: 'exchange', command: 'getBankAccounts', msg: public_token}, parentUrl);
    }
  });

  $scope.enablePlaid = () => {
    window.parent.postMessage({from: 'plaid', to: 'exchange', command: 'enablePlaid'}, parentUrl);
    linkHandler.open();
  };
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
