angular
  .module('walletApp')
  .component('orderDetails', {
    bindings: {
      formattedTrade: '<'
    },
    controller: function ($scope) {
      $scope.hideHeader = true;
      $scope.formattedTrade = this.formattedTrade;
    },
    templateUrl: 'partials/trade-summary.jade'
  });
