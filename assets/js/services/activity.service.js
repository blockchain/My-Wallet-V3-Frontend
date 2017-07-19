angular
  .module('walletApp')
  .factory('Activity', Activity);

Activity.$inject = ['$rootScope', 'AngularHelper', '$timeout', 'Wallet', 'MyWallet', 'buySell', 'Ethereum'];

function Activity ($rootScope, AngularHelper, $timeout, Wallet, MyWallet, buySell, Ethereum) {
  var txSub;
  console.log(MyWallet);

  const activity = {
    activities: [],
    btcTransactions: [],
    ethTransactions: [],
    logs: [],
    limit: 8,
    timeSort,
    btcTxFactory,
    ethTxFactory,
    logFactory,
    updateBtcTxActivities,
    updateEthTxActivities,
    updateLogActivities,
    updateAllActivities
  };

  let getTxMessage = (hash, type, asset) => (
    buySell.getTxMethod(hash) === 'buy' ? 'BOUGHT' : `${type} ${asset.toUpperCase()}`
  );

  setTxSub();
  $rootScope.$on('updateActivityFeed', activity.updateAllActivities);
  $rootScope.$watch(() => Ethereum.defaultAccount && Ethereum.defaultAccount.txs, activity.updateEthTxActivities);
  return activity;

  // Wait for wallet to be defined before subscribing to tx updates
  function setTxSub () {
    let w = MyWallet.wallet;
    if (txSub) {
      return;
    } else if (w) {
      txSub = w.txList.subscribe(updateBtcTxActivities);
    } else {
      $timeout(setTxSub, 250);
    }
  }

  function updateAllActivities () {
    activity.updateBtcTxActivities();
    activity.updateEthTxActivities();
    activity.updateLogActivities();
  }

  function updateBtcTxActivities () {
    activity.btcTransactions = MyWallet.wallet.txList.transactions()
      .slice(0, activity.limit)
      .map(btcTxFactory);
    combineAll();
  }

  function updateEthTxActivities () {
    if (!Ethereum.defaultAccount) return;
    activity.ethTransactions = Ethereum.defaultAccount.txs
      .slice(0, activity.limit)
      .map(ethTxFactory);
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
      .concat(activity.logs)
      .filter(hasTime)
      .sort(timeSort)
      .slice(0, activity.limit);
    AngularHelper.$safeApply();
  }

  function btcTxFactory (obj) {
    return angular.merge(txFactory(obj), {
      message: getTxMessage(obj.hash, obj.txType, 'btc'),
      labelClass: obj.txType.toLowerCase()
    });
  }

  function ethTxFactory (obj) {
    let txType = obj.isFromAccount(Ethereum.defaultAccount) ? 'sent' : 'received';
    return angular.merge(txFactory(obj), {
      message: getTxMessage(obj.hash, txType, 'eth'),
      labelClass: txType,
      asset: 'eth'
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
