angular
  .module('walletApp')
  .factory('ShapeShift', ShapeShift);

function ShapeShift (Wallet, modals) {
  const service = {
    get shapeshift () {
      return Wallet.my.wallet.shapeshift;
    }
  };

  service.getRate = (pair) => {
    return service.shapeshift.getRate(pair);
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

  service.buildPayment = (quote, fee) => {
    return service.shapeshift.buildPayment(quote, fee);
  };

  service.checkForCompletedTrades = () => {
    service.shapeshift.checkForCompletedTrades(modals.openShiftTradeDetails);
  };

  service.fetchFullTrades = () => {
    return service.shapeshift.fetchFullTrades();
  };

  service.isDepositTx = (hash) => {
    return service.shapeshift.isDepositTx(hash);
  };

  service.isWithdrawalTx = (hash) => {
    return service.shapeshift.isWithdrawalTx(hash);
  };

  window.ShapeShift = service;
  return service;
}
