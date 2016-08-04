angular
  .module('walletApp')
  .factory('formatTrade', formatTrade);

formatTrade.$inject = ['$filter', 'MyWallet'];

function formatTrade ($filter, MyWallet) {
  const service = {
    error: error,
    review: review,
    success: success,
    pending: pending
  };

  let label = MyWallet.wallet.hdwallet.accounts[0].label;

  let addTradeDetails = (tx, trade) => {
    tx['Coinify Trade'] = trade.id;
    tx['Date Initialized'] = $filter('date')(trade.createdAt, 'MM/dd/yyyy @ h:mma');
    tx['BTC Receiving Address'] = trade.receiveAddress;

    return tx;
  };

  function error (tx, trade, namespace) {
    tx = addTradeDetails(tx, trade);

    return {
      tx: tx,
      error: true,
      icon: 'ti-alert',
      status: 'security-red',
      namespace: namespace,
      values: {fiatAmt: trade.inAmount + ' ' + trade.inCurrency, btcAmt: trade.outAmountExpected}
    };
  }

  function success (trade) {
    return {
      status: 'success',
      icon: 'ti-direction-alt',
      tx: {id: trade.iSignThisID},
      values: {
        label: label,
        fiatAmt: trade.inAmount + ' ' + trade.inCurrency,
        btcAmt: trade.outAmountExpected
      },
      namespace: 'TX_SUCCESS'
    };
  }

  function pending (tx, trade) {
    tx = addTradeDetails(tx, trade);

    return {
      tx: tx,
      status: 'blue',
      icon: 'ti-direction-alt',
      values: {
        label: label,
        fiatAmt: trade.inAmount + ' ' + trade.inCurrency,
        btcAmt: trade.outAmountExpected
      },
      namespace: 'TX_PENDING'
    };
  }

  function review (tx, trade) {
    tx = addTradeDetails(tx, trade);

    return {
      tx: tx,
      status: 'blue',
      icon: 'ti-direction-alt',
      namespace: 'TX_IN_REVIEW',
      values: {
        fiatAmt: trade.inAmount + ' ' + trade.inCurrency,
        btcAmt: trade.outAmountExpected
      }
    };
  }

  return service;
}
