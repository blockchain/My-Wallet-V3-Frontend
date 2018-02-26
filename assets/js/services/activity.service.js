angular
  .module('walletApp')
  .factory('Activity', Activity);

Activity.$inject = ['$rootScope', 'AngularHelper', '$timeout', 'Wallet', 'MyWallet', 'coinify', 'sfox', 'unocoin', 'Ethereum', 'BitcoinCash'];
function Activity ($rootScope, AngularHelper, $timeout, Wallet, MyWallet, coinify, sfox, unocoin, Ethereum, BitcoinCash) {
  var txSub;

  const activity = {
    activities: [],
    btcTransactions: [],
    ethTransactions: [],
    bchTransactions: [],
    logs: [],
    limit: 8,
    timeSort,
    logFactory,
    messageFactory,
    updateBchTxActivities,
    updateBtcTxActivities,
    updateEthTxActivities,
    updateLogActivities,
    updateAllActivities
  };

  let getTxMessage = (hash, type, asset) => {
    let exchangeTx = [coinify.getTxMethod(hash), sfox.getTxMethod(hash), unocoin.getTxMethod(hash)].filter(x => x)[0];

    if (exchangeTx) {
      return exchangeTx === 'buy' ? 'Bought BTC' : 'Sold BTC';
    }

    return `${type} ${asset.toUpperCase()}`;
  };

  setTxSub();

  return activity;

  // Wait for wallet to be defined before subscribing to tx updates
  function setTxSub () {
    let w = MyWallet.wallet;

    if (txSub) {
    } else if (w) {
      txSub = w.txList.subscribe(updateBtcTxActivities);
      $rootScope.$watch(() => Ethereum.txs, activity.updateEthTxActivities, true);
      $rootScope.$watch(() => BitcoinCash.txs, activity.updateBchTxActivities, true);
      $rootScope.$on('updateActivityFeed', activity.updateAllActivities);
    } else {
      $timeout(setTxSub, 250);
    }
  }

  function updateAllActivities () {
    activity.updateBtcTxActivities();
    activity.updateEthTxActivities();
    activity.updateBchTxActivities();
    activity.updateLogActivities();
  }

  function updateBtcTxActivities () {
    activity.btcTransactions = MyWallet.wallet.txList.transactions()
      .slice(0, activity.limit)
      .map(messageFactory);
    combineAll();
  }

  function updateEthTxActivities () {
    activity.ethTransactions = Ethereum.txs
      .slice(0, activity.limit)
      .map(messageFactory);
    combineAll();
  }

  function updateBchTxActivities () {
    activity.bchTransactions = BitcoinCash.txs
      .slice(0, activity.limit)
      .map(messageFactory);
    combineAll();
  }

  function updateLogActivities () {
    if (Wallet.settings.loggingLevel > 0) {
      Wallet.getActivityLogs(logs => {
        activity.logs = logs.results
          .slice(0, activity.limit)
          .map(logFactory);
        combineAll();
      });
    } else {
      activity.logs = [];
      combineAll();
    }
  }

  function combineAll () {
    activity.activities = activity.btcTransactions
      .concat(activity.ethTransactions)
      .concat(activity.bchTransactions)
      .concat(activity.logs)
      .filter(hasTime)
      .sort(timeSort)
      .slice(0, activity.limit);
    AngularHelper.$safeApply();
  }

  function messageFactory (obj) {
    let txType;
    if (obj.coinCode === 'eth') { txType = obj.getTxType(Ethereum.eth.activeAccountsWithLegacy); }
    return angular.merge(txFactory(obj), {
      message: getTxMessage(obj.hash, txType || obj.txType, obj.coinCode),
      labelClass: txType || obj.txType.toLowerCase(),
      asset: obj.coinCode
    });
  }

  function txFactory (obj) {
    return {
      type: 0,
      icon: 'icon-tx',
      time: obj.time * 1000,
      amount: Math.abs(obj.amount)
    };
  }

  function logFactory (obj) {
    return {
      type: 4,
      icon: 'ti-settings',
      time: obj.time,
      message: obj.action,
      labelClass: obj.action.toLowerCase()
    };
  }

  function timeSort (x, y) {
    return y.time - x.time;
  }

  function hasTime (x) {
    return (x.time != null) && x.time > 0;
  }
}
