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
    let transaction = {};
    transaction['Coinify trade:'] = '#' + trade.id;
    transaction['iSignthis ID:'] = tx.id;
    transaction['Date initialized:'] = $filter('date')(trade.createdAt, 'MM/dd/yyyy @ h:mma');
    transaction['Receiving wallet:'] = label;
    transaction['QA: BTC receiving address:'] = trade.receiveAddress;

    return transaction;
  };

  function error (tx, trade, namespace) {
    tx = addTradeDetails(tx, trade);

    return {
      tx: tx,
      class: 'state-danger-text',
      namespace: namespace,
      values: {fiatAmt: trade.inAmount + ' ' + trade.inCurrency, btcAmt: trade.outAmountExpected}
    };
  }

  function success (tx, trade) {
    tx = addTradeDetails(tx, trade);

    return {
      class: 'success',
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
      class: 'blue',
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
      status: 'success',
      namespace: 'TX_IN_REVIEW',
      values: {
        fiatAmt: trade.inAmount + ' ' + trade.inCurrency,
        btcAmt: trade.outAmountExpected
      }
    };
  }

  return service;
}
