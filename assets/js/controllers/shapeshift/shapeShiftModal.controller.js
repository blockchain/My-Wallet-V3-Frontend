angular
  .module('walletApp')
  .controller('ShapeShiftModalController', ShapeShiftModalController);

function ShapeShiftModalController ($scope, coin) {
  this.asset = coin;
}
