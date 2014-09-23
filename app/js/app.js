'use strict';

/* App Module */

var walletApp = angular.module('walletApp', [
  'ngRoute',
  'walletControllers',
  'walletFilters',
  'walletServices'
]);

walletApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'partials/wallet',
        controller: 'WalletCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);
