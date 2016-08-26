angular
  .module('walletApp')
  .factory('formatTrade', formatTrade);

formatTrade.$inject = ['$filter', 'MyWallet', '$rootScope'];

function formatTrade ($filter, MyWallet, $rootScope) {
  const service = {
    error,
    review,
    success,
    pending,
    kyc
  };

  let label = MyWallet.wallet.hdwallet.accounts[0].label;

  let addTradeDetails = (tx, trade) => {
    let transaction = {};
    transaction['COINIFY_TRADE'] = '#' + trade.id;
    transaction['ISX_ID'] = trade.iSignThisID;
    transaction['DATE_INITIALIZED'] = $filter('date')(trade.createdAt, 'MM/dd/yyyy @ h:mma');
    transaction['RECEIVING_WALLET'] = label;
    if ($rootScope.buySellDebug) {
      transaction['RECEIVING_ADDRESS'] = trade.receiveAddress;
    }
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
      tx: tx,
      class: 'success',
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
      class: 'blue',
      namespace: 'TX_IN_REVIEW',
      values: {
        fiatAmt: trade.inAmount + ' ' + trade.inCurrency,
        btcAmt: trade.outAmountExpected
      }
    };
  }

  function kyc (tx, trade) {
    tx = addTradeDetails(tx, trade);
    delete tx.COINIFY_TRADE;
    delete tx.RECEIVING_WALLET;
    delete tx.RECEIVING_ADDRESS;

    return {
      tx: tx,
      class: 'state-danger-text',
      namespace: 'TX_KYC_PENDING',
      values: {}
    };
  }

  return service;
}
