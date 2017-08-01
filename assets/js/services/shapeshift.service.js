angular
  .module('walletApp')
  .factory('ShapeShift', ShapeShift);

function ShapeShift (Wallet) {
  const service = {
    get shapeshift () {
      return Wallet.my.wallet.shapeshift;
    }
  };

  service.getQuote = (pair, amount) => {
    return service.shapeshift.getQuote(pair, amount);
  };

  window.ShapeShift = service;
  return service;
}
