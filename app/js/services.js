'use strict';

/* Services */

var walletServices = angular.module('walletServices', ['ngResource']);

walletServices.factory('Wallet', ['$resource',
  function($resource){
    return {}
  }]);