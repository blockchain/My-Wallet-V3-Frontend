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

  service.translateStatus = status => {
    switch (status) {
      case 'complete':
        return 'Trade Complete';
      case 'no_deposits':
      case 'received':
        return 'Exchange in Progress';
      case 'failed':
        return 'Trade Failed';
      case 'expired':
        return 'Trade Expired';
      case 'cancelled':
        return 'Trade Cancelled';
    }
  };

  window.ShapeShift = service;
  return service;
}
