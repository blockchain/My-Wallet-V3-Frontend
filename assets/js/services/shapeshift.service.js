angular
  .module('walletApp')
  .factory('ShapeShift', ShapeShift);

function ShapeShift (Wallet) {
  const service = {
    get shapeshift () {
      return Wallet.my.wallet.shapeshift;
    }
  };

  service.getApproximateQuote = (pair, amount) => {
    return service.shapeshift.getApproximateQuote(pair, amount);
  };

  service.getQuote = (pair, amount) => {
    return service.shapeshift.getQuote(pair, amount);
  };

  service.shift = (quote) => {
    return Wallet.askForSecondPasswordIfNeeded()
                 .then((secPass) => service.shapeshift.shift(quote, secPass));
  };

  service.watchTradeForCompletion = (trade) => {
    return service.shapeshift.watchTradeForCompletion(trade);
  };

  window.ShapeShift = service;
  return service;
}
