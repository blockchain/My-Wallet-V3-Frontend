angular
  .module('walletApp')
  .controller('ShiftCheckoutController', ShiftCheckoutController);

function ShiftCheckoutController ($scope, $stateParams, ShapeShift) {
  $scope.tabs = {
    selectedTab: $stateParams.selectedTab || 'EXCHANGE',
    options: ['EXCHANGE', 'ORDER_HISTORY'],
    select (tab) { this.selectedTab = this.selectedTab ? tab : null; }
  };

  $scope.quoteHandler = ShapeShift.getQuote;
}
