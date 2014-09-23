'use strict';

/* Filters */

// Not used:
angular.module('walletFilters', []).filter('checkmark', function() {
  return function(input) {
    return input ? '\u2713' : '\u2718';
  };
});
