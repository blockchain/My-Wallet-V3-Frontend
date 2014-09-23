'use strict';

/* Controllers */

var walletControllers = angular.module('walletControllers', []);

walletControllers.controller('WalletCtrl', ['$scope',
  function($scope) {
    $scope.hello = 'world';
  }]);