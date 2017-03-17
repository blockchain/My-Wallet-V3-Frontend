angular
  .module('walletApp')
  .factory('formatTrade', formatTrade);

formatTrade.$inject = ['$rootScope', '$filter', 'Wallet', 'MyWallet', 'currency'];

function formatTrade ($rootScope, $filter, Wallet, MyWallet, currency) {
  const service = {
    confirm,
    reviewing,
    processing,
    cancelled,
    rejected,
    failed,
    expired,
    completed,
    completed_test,
    initiated,

    reject_card,
    kyc,
    error,
    success,
    labelsForCurrency,
    bank_transfer
  };

  let errorStates = {
    'cancelled': 'canceled',
    'rejected': 'rejected',
    'expired': 'expired'
  };

  let isKYC = (trade) => trade.constructor.name === 'CoinifyKYC';

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
    let showTradeID = !account;
    let transaction = {
      'TRADE_ID': showTradeID ? '#' + trade.id : null,
      'DATE_INITIALIZED': $filter('date')(trade.createdAt, 'd MMMM yyyy, HH:mm'),
      'BTC_PURCHASED': currency.convertFromSatoshi(trade.outAmount || trade.outAmountExpected, currency.bitCurrencies[0]),
      'PAYMENT_METHOD': account ? account.accountType + ' ' + account.accountNumber : null,
      'TOTAL_COST': currency.formatCurrencyForView(trade.sendAmount / 100, { code: trade.inCurrency })
    };
    if ($rootScope.buySellDebug) {
      transaction['RECEIVING_ADDRESS'] = trade.receiveAddress;
    }
    return transaction;
  };

  function error (trade, state) {
    let tx = addTradeDetails(trade);
    if (isKYC(trade)) { return service.kyc(trade, 'rejected'); }
    if (state === 'rejected' && trade.medium === 'card') { return service.reject_card(trade, 'rejected'); }

    return {
      tx: tx,
      class: 'state-danger-text',
      namespace: 'TX_ERROR_STATE',
      values: {
        state: state || getState(trade.state)
      }
    };
  }

  function confirm (trade) {
    return {
      tx: trade,
      values: {},
      namespace: 'TX_CONFIRM'
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
    if (isKYC(trade)) { return service.kyc(trade, 'reviewing'); }

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

  function reject_card (trade, state) {
    let namespace = 'TX_CARD_REJECTED';
    let tx = addTradeDetails(trade);

    return {
      tx: tx,
      class: 'state-danger-text',
      namespace: namespace,
      values: {
        state: state || getState(trade.state)
      }
    };
  }

  function kyc (trade, state) {
    let classname = state === 'reviewing' ? 'blue' : 'state-danger-text';
    let namespace = state === 'reviewing' ? 'TX_KYC_REVIEWING' : 'TX_KYC_REJECTED';

    return {
      class: classname,
      namespace: namespace,
      values: {
        date: $filter('date')(trade.createdAt, 'MM/dd')
      }
    };
  }

  function labelsForCurrency (currency) {
    if (currency === 'DKK') {
      return { accountNumber: 'Reg. Number', bankCode: 'Account Number' };
    }
    return { accountNumber: 'IBAN', bankCode: 'BIC' };
  }

  function bank_transfer (trade) {
    const labels = labelsForCurrency(trade.inCurrency);
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
        [labels.accountNumber]: trade.bankAccount.number,
        [labels.bankCode]: trade.bankAccount.bic,
        'Bank': [
          trade.bankAccount.bankName,
          trade.bankAccount.bankAddress.street,
          trade.bankAccount.bankAddress.zipcode + ' ' + trade.bankAccount.bankAddress.city,
          trade.bankAccount.bankAddress.country
        ].join(', '),
        'Reference/Message': `Order ID ${trade.bankAccount.referenceText}`
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
