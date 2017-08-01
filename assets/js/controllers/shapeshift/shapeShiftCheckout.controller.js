angular
  .module('walletApp')
  .controller('ShapeShiftCheckoutController', ShapeShiftCheckoutController);

function ShapeShiftCheckoutController ($scope, $stateParams, ShapeShift) {
  $scope.tabs = {
    selectedTab: $stateParams.selectedTab || 'EXCHANGE',
    options: ['EXCHANGE', 'ORDER_HISTORY'],
    select (tab) { this.selectedTab = this.selectedTab ? tab : null; }
  };

  $scope.quoteHandler = ShapeShift.getQuote;
}
