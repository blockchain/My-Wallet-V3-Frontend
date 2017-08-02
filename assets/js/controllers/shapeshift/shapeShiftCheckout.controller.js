angular
  .module('walletApp')
  .controller('ShapeShiftCheckoutController', ShapeShiftCheckoutController);

function ShapeShiftCheckoutController ($scope, $stateParams, Wallet, ShapeShift) {
  $scope.tabs = {
    selectedTab: $stateParams.selectedTab || 'EXCHANGE',
    options: ['EXCHANGE', 'ORDER_HISTORY'],
    select (tab) { this.selectedTab = this.selectedTab ? tab : null; }
  };

  $scope.fiat = Wallet.settings.currency;
  $scope.quoteHandler = ShapeShift.getQuote;
  $scope.shiftHandler = ShapeShift.shift;
  $scope.shiftSuccess = (trade) => { debugger; };
}
