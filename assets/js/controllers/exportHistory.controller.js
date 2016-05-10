angular
  .module('walletApp')
  .controller('ExportHistoryController', ExportHistoryController);

function ExportHistoryController ($scope, $window, $q, MyWallet, Alerts, filterBy) {
  $scope.alerts = [];
  $scope.getTxColor = (action) => ({ sent: 'send-red', received: 'receive-green', transfer: 'transfer-blue' })[action];

  $scope.format = 'MM/dd/yyyy';
  $scope.startDate = Date.now();
  $scope.endDate = Date.now() - 604800000;

  $scope.filterBy = filterBy;
  $scope.filterTypes = ['ALL', 'SENT', 'RECEIVED', 'TRANSFERRED'];
  $scope.setFilterType = (type) => $scope.filterBy = $scope.filterTypes[type];
  $scope.isFilterType = (type) => $scope.filterBy === $scope.filterTypes[type];

  $scope.filterTx = (tx) => (
    ($scope.isFilterType(0)) ||
    (tx.action === 'sent' && $scope.isFilterType(1)) ||
    (tx.action === 'receive' && $scope.isFilterType(2)) ||
    (tx.action === 'transfer' && $scope.isFilterType(3))
  );

  $scope.exportHistory = () => {
    $scope.loading = true;
    $q.resolve(MyWallet.wallet.exportHistory($scope.startDate, $scope.endDate))
      .then(data => {
        let noHistory = 'NO_HISTORY';
        if (data.length === 0) throw noHistory;
        let csv = $scope.json2csv(data.filter($scope.filterTx));
        let url = $scope.linkDataToURL(csv);
        $scope.$root.$broadcast('download', { url, name: 'history.csv' });
      })
      .catch(err => {
        let msg = err.message || err.error || err;
        Alerts.displayError(msg, false, $scope.alerts);
      })
      .then(() => $scope.loading = false);
  };

  $scope.json2csv = (json) => {
    if (!Array.isArray(json) || !json.length) return '';
    let headers = Object.keys(json[0]);
    let csv = [headers.join(',')].concat(json.map(item => {
      return headers.map(h => item[h]).join(',');
    })).join('\n');
    return csv;
  };

  $scope.linkDataToURL = (data) => {
    let blob = new $window.Blob([data], { type: 'text/plain' });
    return $window.URL.createObjectURL(blob);
  };
}
