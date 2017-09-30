angular
  .module('walletApp')
  .controller('ShapeShiftModalController', ShapeShiftModalController);

function ShapeShiftModalController ($scope, Env, coin) {
  this.asset = coin;
}
