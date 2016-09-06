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

  let getLabel = (trade) => {
    let accountIndex = trade.accountIndex;
    return accountIndex ? MyWallet.wallet.hdwallet.accounts[accountIndex].label : '';
  };

  let addTradeDetails = (tx, trade) => {
    let transaction = {};
    transaction['COINIFY_TRADE'] = '#' + trade.id;
    transaction['ISX_ID'] = trade.iSignThisID;
    transaction['DATE_INITIALIZED'] = $filter('date')(trade.createdAt, 'MM/dd/yyyy @ h:mma');
    transaction['RECEIVING_WALLET'] = getLabel(trade);
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
      values: {
        curr: trade.inCurrency,
        fiatAmt: trade.sendAmount / 100,
        btcAmt: trade.outAmountExpected / 100000000
      }
    };
  }

  function success (tx, trade) {
    tx = addTradeDetails(tx, trade);

    return {
      tx: tx,
      class: 'success',
      values: {
        label: getLabel(trade),
        curr: trade.inCurrency,
        fiatAmt: trade.sendAmount / 100,
        btcAmt: trade.outAmountExpected / 100000000
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
        label: getLabel(trade),
        curr: trade.inCurrency,
        fiatAmt: trade.sendAmount / 100,
        btcAmt: trade.outAmountExpected / 100000000
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
        curr: trade.inCurrency,
        fiatAmt: trade.sendAmount / 100,
        btcAmt: trade.outAmountExpected / 100000000
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
      class: 'blue',
      namespace: 'TX_KYC_PENDING',
      values: {}
    };
  }

  return service;
}
