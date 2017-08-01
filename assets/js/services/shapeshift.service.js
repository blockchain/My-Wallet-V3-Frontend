angular
  .module('walletApp')
  .factory('ShapeShift', ShapeShift);

function ShapeShift (Wallet) {
  const service = {
    get shapeshift () {
      return Wallet.my.wallet.shapeshift;
    }
  };

  service.getQuote = (pair, amount, withdrawl, address) => {
    return service.shapeshift.getQuote(pair, amount, withdrawl, address);
  };

  window.ShapeShift = service;
  return service;
}
