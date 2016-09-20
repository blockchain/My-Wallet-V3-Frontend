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

    kyc,
    error,
    success,
    bank_transfer
  };

  let getLabel = (trade) => {
    let accountIndex = trade.accountIndex;
    return accountIndex != null ? MyWallet.wallet.hdwallet.accounts[accountIndex].label : '';
  };

  function rejected (trade) { return service.error(trade, 'rejected'); }
  function cancelled (trade) { return service.error(trade); }
  function failed (trade) { return service.error(trade); }
  function expired (trade) { return service.error(trade); }
  function completed (trade) { return service.success(trade); }
  function completed_test (trade) { return service.success(trade); }

  let addTradeDetails = (trade) => {
    let transaction = {};
    transaction['COINIFY_TRADE'] = '#' + trade.id;
    transaction['ISX_ID'] = trade.iSignThisID;
    transaction['DATE_INITIALIZED'] = $filter('date')(trade.createdAt, 'd MMMM yyyy, HH:mm');
    transaction['RECEIVING_WALLET'] = getLabel(trade);
    if ($rootScope.buySellDebug) {
      transaction['RECEIVING_ADDRESS'] = trade.receiveAddress;
    }
    return transaction;
  };

  function error (trade, state) {
    let tx = addTradeDetails(trade);

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

  function success (trade) {
    let tx = addTradeDetails(trade);
    if (!trade.bitcoinReceived) { return service.processing(trade); }

    tx['DOWNLOAD_RECEIPT'] = ' ';

    return {
      tx: tx,
      class: 'success',
      values: {
        label: getLabel(trade),
        curr: trade.inCurrency,
        fiatAmt: trade.sendAmount / 100,
        btcAmt: (trade.outAmount || trade.outAmountExpected) / 100000000,
        url: $rootScope.buySellDebug && !trade.receiptUrl ? 'https://goo.gl/uXkl8O' : trade.receiptUrl
      },
      namespace: 'TX_SUCCESS'
    };
  }

  function processing (trade) {
    let tx = addTradeDetails(trade);

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

  function reviewing (trade) {
    let tx = addTradeDetails(trade);

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

  function kyc (trade) {
    let tx = addTradeDetails(trade);
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

  function bank_transfer (trade) {
    return {
      class: 'state-danger-text',
      namespace: 'TX_BANK_TRANSFER',
      tx: {
        'Recipient Name': trade.bankAccount.holderName,
        'Recipient Address': [
          trade.bankAccount.holderAddress.street,
          trade.bankAccount.holderAddress.zipcode + ' ' + trade.bankAccount.holderAddress.city,
          trade.bankAccount.holderAddress.country
        ].join(', '),
        'IBAN': trade.bankAccount.number,
        'BIC': trade.bankAccount.bic,
        'Bank': [
          trade.bankAccount.bankName,
          trade.bankAccount.bankAddress.street,
          trade.bankAccount.bankAddress.zipcode + ' ' + trade.bankAccount.bankAddress.city,
          trade.bankAccount.bankAddress.country
        ].join(', '),
        'Message': trade.bankAccount.referenceText
      },
      values: {
        label: getLabel(trade),
        curr: trade.inCurrency,
        amt: trade.inAmount / 100
      }
    };
  }

  return service;
}
