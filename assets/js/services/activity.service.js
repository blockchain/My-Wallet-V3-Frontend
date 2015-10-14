angular
  .module('activity', [])
  .factory('Activity', Activity);

Activity.$inject = ['$rootScope', 'Wallet'];

function Activity($rootScope, Wallet) {
  const activity = {
    activities: [],
    transactions: [],
    logs: [],
    limit: 8,
    updateTxActivities: updateTxActivities,
    updateLogActivities: updateLogActivities,
    updateAllActivities: updateAllActivities
  };

  $rootScope.$on('updateActivityFeed', activity.updateAllActivities);
  return activity;

  function updateAllActivities() {
    activity.updateTxActivities();
    activity.updateLogActivities();
  }

  function updateTxActivities() {
    activity.transactions = Wallet.transactions
      .slice(0, activity.limit)
      .map(factory.bind(null, 0));
    combineAll();
  }

  function updateLogActivities() {
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

  function combineAll() {
    activity.activities = activity.transactions
      .concat(activity.logs)
      .filter(hasTime)
      .sort(timeSort)
      .slice(0, activity.limit);
    $rootScope.$safeApply();
  }

  function factory(type, obj) {
    let a = {
      type: type
    };
    switch (type) {
      case 0:
        a.title = 'TRANSACTION';
        a.icon = 'ti-layout-list-post';
        a.time = obj.txTime * 1000;
        a.message = getTxMessage(obj);
        a.result = Math.abs(obj.result);
        break;
      case 4:
        a.title = 'LOG';
        a.icon = 'ti-settings';
        a.time = obj.time;
        a.message = capitalize(obj.action);
    }
    return a;
  }

  function getTxMessage(tx) {
    if (tx.intraWallet) return 'TRANSFERRED';
    else if (tx.result < 0) return 'SENT';
    else return 'RECEIVED';
  }

  function capitalize(str) {
    return str[0].toUpperCase() + str.substr(1);
  }

  function timeSort(x, y) {
    return y.time - x.time;
  }

  function hasTime(x) {
    return (x.time != null) && x.time > 0;
  }
}
