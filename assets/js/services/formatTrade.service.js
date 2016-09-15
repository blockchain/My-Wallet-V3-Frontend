angular
  .module('walletApp')
  .factory('formatTrade', formatTrade);

formatTrade.$inject = ['$filter', 'MyWallet', '$rootScope'];

function formatTrade ($filter, MyWallet, $rootScope) {
  const service = {
    // format for possible coinify trade states
    // awaiting_transfer_in is ignored because trade is not in a formattable state yet
    reviewing,
    processing,
    cancelled,
    rejected,
    failed,
    expired,
    completed,
    completed_test,

    error,
    success,
    kyc
  };

  let getLabel = (trade) => {
    let accountIndex = trade.accountIndex;
    return accountIndex != null ? MyWallet.wallet.hdwallet.accounts[accountIndex].label : '';
  };

  function rejected (tx, trade) { return service.error(tx, trade, 'rejected'); }
  function cancelled (tx, trade) { return service.error(tx, trade); }
  function failed (tx, trade) { return service.error(tx, trade); }
  function expired (tx, trade) { return service.error(tx, trade); }
  function completed (tx, trade) { return service.success(tx, trade); }
  function completed_test (tx, trade) { return service.success(tx, trade); }

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

  function error (tx, trade, state) {
    tx = addTradeDetails(tx, trade);

    return {
      tx: tx,
      class: 'state-danger-text',
      namespace: 'TX_ERROR_STATE',
      values: {
        curr: trade.inCurrency,
        state: state || trade.state,
        fiatAmt: trade.sendAmount / 100,
        btcAmt: (trade.outAmount || trade.outAmountExpected) / 100000000
      }
    };
  }

  function success (tx, trade) {
    tx = addTradeDetails(tx, trade);
    if (!trade.bitcoinReceived) { return service.processing(tx, trade); }

    return {
      tx: tx,
      class: 'success',
      values: {
        label: getLabel(trade),
        curr: trade.inCurrency,
        fiatAmt: trade.sendAmount / 100,
        btcAmt: (trade.outAmount || trade.outAmountExpected) / 100000000
      },
      namespace: 'TX_SUCCESS'
    };
  }

  function processing (tx, trade) {
    tx = addTradeDetails(tx, trade);

    return {
      tx: tx,
      class: 'blue',
      values: {
        label: getLabel(trade),
        curr: trade.inCurrency,
        fiatAmt: trade.sendAmount / 100,
        btcAmt: (trade.outAmount || trade.outAmountExpected) / 100000000
      },
      namespace: 'TX_PENDING'
    };
  }

  function reviewing (tx, trade) {
    tx = addTradeDetails(tx, trade);

    return {
      tx: tx,
      class: 'blue',
      namespace: 'TX_IN_REVIEW',
      values: {
        curr: trade.inCurrency,
        fiatAmt: trade.sendAmount / 100,
        btcAmt: (trade.outAmount || trade.outAmountExpected) / 100000000
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
