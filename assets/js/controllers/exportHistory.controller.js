angular
  .module('walletApp')
  .controller('ExportHistoryController', ExportHistoryController);

function ExportHistoryController ($scope, $sce, $translate, $filter, format, Wallet, MyWallet, activeIndex) {
  $scope.limit = 50;
  $scope.incLimit = () => $scope.limit += 50;

  $scope.ableBrowsers = ['chrome', 'firefox'];
  $scope.canTriggerDownload = $scope.ableBrowsers.indexOf(browserDetection().browser) > -1;

  let accounts = Wallet.accounts().filter(a => !a.archived && a.index != null);
  let addresses = Wallet.legacyAddresses().filter(a => !a.archived).map(a => a.address);

  let all = {
    index: '',
    label: $translate.instant('ALL'),
    address: accounts.map(a => a.extendedPublicKey).concat(addresses)
  };

  let imported = {
    index: 'imported',
    label: $translate.instant('IMPORTED_ADDRESSES'),
    address: addresses
  };

  $scope.targets = [all].concat(accounts.map(format.origin));
  if (addresses.length) $scope.targets.push(imported);

  $scope.isLast = (t) => t === $scope.targets[$scope.limit - 1];

  $scope.activeCount = (
    Wallet.accounts().filter(a => !a.archived).length +
    Wallet.legacyAddresses().filter(a => !a.archived).length
  );

  $scope.active = $scope.activeCount === 1
    ? all : $scope.targets.filter(t => t.index.toString() === activeIndex)[0];

  $scope.format = 'dd/MM/yyyy';
  $scope.options = { minDate: new Date(1231024500000), maxDate: new Date() };

  $scope.exportFormat = 'csv';
  $scope.start = { open: false, date: Date.now() - 604800000 };
  $scope.end = { open: false, date: Date.now() };

  $scope.formatDate = (date) => $filter('date')(date, 'dd/MM/yyyy');

  $scope.submit = () => {
    $scope.busy = true;
    let start = $scope.formatDate($scope.start.date);
    let end = $scope.formatDate($scope.end.date);
    let active = $scope.active.address || $scope.active.xpub;
    Wallet.exportHistory(start, end, active)
      .then((data) => {
        $scope.history = data;
        $scope.canTriggerDownload && $scope.$broadcast('download');
      })
      .finally(() => $scope.busy = false);
  };
}
