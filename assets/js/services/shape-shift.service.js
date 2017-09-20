angular
  .module('walletApp')
  .factory('ShapeShift', ShapeShift);

function ShapeShift (Wallet, modals, MyWalletHelpers, Ethereum, Env, BrowserHelper, Condition) {
  const qaDebuggerCond = Condition.of(() => ({
    passed: service.qaDebugger,
    reason: [`qa debug is ${service.qaDebugger ? '' : 'not '}enabled`]
  }));

  const accessCondition = Condition.empty()
    .is(qaDebuggerCond)
    .or(Condition.empty()
      .is(Ethereum.accessCondition)
      .is(Condition.inStateWhitelist)
      .isNot(Condition.inCountryBlacklist)
    );

  const service = {
    get shapeshift () {
      return Wallet.my.wallet.shapeshift;
    },
    options: {},
    get conditionEnv () {
      let { accountInfo } = Wallet.my.wallet;
      return { accountInfo, options: this.options };
    },
    get userHasAccess () {
      if (Wallet.my.wallet == null) return false;
      return accessCondition.test(this.conditionEnv).passed;
    },
    get userAccessReason () {
      if (Wallet.my.wallet == null) return '';
      return Condition.format('ShapeShift', accessCondition.test(this.conditionEnv));
    },
    get USAState () {
      return Wallet.my.wallet.shapeshift.USAState;
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

  service.setUSAState = (state) => {
    return service.shapeshift.setUSAState(state);
  };

  service.signupForShift = (email, state) => {
    BrowserHelper.safeWindowOpen(`https://docs.google.com/forms/d/e/1FAIpQLSd0r6NU82pQNka87iUkQJc3xZq6y0UHYHo09eZH-6SQZlTZrg/viewform?entry.1192956638=${email}&entry.387129390=${state}`);
  };

  Env.then((options) => {
    let { shapeshift, qaDebugger } = options;
    service.options = shapeshift;
    service.qaDebugger = qaDebugger;
  });

  window.ShapeShift = service;

  return service;
}
