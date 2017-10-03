angular
  .module('walletApp')
  .controller('ShapeShiftModalController', ShapeShiftModalController);

function ShapeShiftModalController (asset) {
  this.asset = asset;
}
