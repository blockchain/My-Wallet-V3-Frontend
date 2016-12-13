angular
  .module('walletApp')
  .factory('formatTrade', formatTrade);

formatTrade.$inject = ['$rootScope', '$filter', 'Wallet', 'MyWallet', 'currency'];

function formatTrade ($rootScope, $filter, Wallet, MyWallet, currency) {
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
    initiated,

    kyc,
    error,
    success,
    bank_transfer
  };

  let errorStates = {
    'cancelled': 'canceled',
    'rejected': 'rejected',
    'expired': 'expired'
  };

  let getState = (state) => errorStates[state] || state;

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

  let addTradeDetails = (trade, account) => {
    let transaction = {
      'DATE_INITIALIZED': $filter('date')(trade.createdAt, 'd MMMM yyyy, HH:mm'),
      'BTC_PURCHASED': currency.convertFromSatoshi(trade.outAmount || trade.outAmountExpected, currency.bitCurrencies[0]),
      'PAYMENT_METHOD': account ? account.accountType + ' ' + account.accountNumber : null,
      'TOTAL_COST': currency.formatCurrencyForView(trade.inAmount / 100, { code: trade.inCurrency })
    };
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
        state: state || getState(trade.state)
      }
    };
  }

  function success (trade) {
    let tx = addTradeDetails(trade);
    if (!trade.bitcoinReceived) { return service.processing(trade); }

    return {
      tx: tx,
      class: 'success',
      values: {
        label: getLabel(trade)
      },
      namespace: 'TX_SUCCESS'
    };
  }

  function processing (trade, accounts) {
    let account = accounts && accounts[0];
    let tx = addTradeDetails(trade, account);

    return {
      tx: tx,
      class: 'blue',
      values: {},
      namespace: 'TX_PENDING'
    };
  }

  function reviewing (trade) {
    let tx = addTradeDetails(trade);

    return {
      tx: tx,
      class: 'blue',
      values: {},
      namespace: 'TX_IN_REVIEW'
    };
  }

  function initiated (trade, accounts) {
    let account = accounts && accounts[0];
    let tx = addTradeDetails(trade, account);

    return {
      tx: tx,
      class: 'success',
      values: {
        email: Wallet.user.email
      },
      namespace: 'TX_INITIATED'
    };
  }

  function kyc (trade) {
    return {
      class: 'blue',
      namespace: 'TX_KYC_PENDING',
      values: {
        date: $filter('date')(trade.createdAt, 'MM/dd')
      }
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
