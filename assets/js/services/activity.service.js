angular
  .module('activity', [])
  .factory('Activity', Activity);

Activity.$inject = ['$rootScope', '$timeout', 'Wallet', 'MyWallet'];

function Activity ($rootScope, $timeout, Wallet, MyWallet) {
  var txSub;

  const activity = {
    activities: [],
    transactions: [],
    logs: [],
    limit: 8,
    timeSort: timeSort,
    capitalize: capitalize,
    factory: factory,
    updateTxActivities: updateTxActivities,
    updateLogActivities: updateLogActivities,
    updateAllActivities: updateAllActivities
  };

  setTxSub();
  $rootScope.$on('updateActivityFeed', activity.updateAllActivities);
  return activity;

  // Wait for wallet to be defined before subscribing to tx updates
  function setTxSub () {
    let w = MyWallet.wallet;
    if (txSub) {
      return;
    } else if (w) {
      txSub = w.txList.subscribe(updateTxActivities);
    } else {
      $timeout(setTxSub, 250);
    }
  }

  function updateAllActivities () {
    activity.updateTxActivities();
    activity.updateLogActivities();
  }

  function updateTxActivities () {
    activity.transactions = MyWallet.wallet.txList.transactions()
      .slice(0, activity.limit)
      .map(factory.bind(null, 0));
    combineAll();
  }

  function updateLogActivities () {
    if (Wallet.settings.loggingLevel > 0) {
      Wallet.getActivityLogs(logs => {
        activity.logs = logs.results
          .slice(0, activity.limit)
          .map(factory.bind(null, 4));
        combineAll();
      });
    } else {
      activity.logs = [];
      combineAll();
    }
  }

  function combineAll () {
    activity.activities = activity.transactions
      .concat(activity.logs)
      .filter(hasTime)
      .sort(timeSort)
      .slice(0, activity.limit);
    $rootScope.$safeApply();
  }

  function factory (type, obj) {
    let a = { type: type };
    switch (type) {
      case 0:
        a.title = 'TRANSACTION';
        a.icon = 'ti-layout-list-post';
        a.time = obj.time * 1000;
        a.message = obj.txType.toUpperCase();
        a.amount = Math.abs(obj.amount);
        break;
      case 4:
        a.title = 'LOG';
        a.icon = 'ti-settings';
        a.time = obj.time;
        a.message = capitalize(obj.action);
    }
    return a;
  }

  function capitalize (str) {
    return str[0].toUpperCase() + str.substr(1);
  }

  function timeSort (x, y) {
    return y.time - x.time;
  }

  function hasTime (x) {
    return (x.time != null) && x.time > 0;
  }
}
