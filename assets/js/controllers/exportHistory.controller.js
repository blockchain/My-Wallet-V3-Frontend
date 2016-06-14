angular
  .module('walletApp')
  .controller('ExportHistoryController', ExportHistoryController);

function ExportHistoryController ($scope, $sce, format, Wallet, MyWallet, activeIndex) {
  let accounts = Wallet.accounts().filter(a => !a.archived && a.index != null);
  let addresses = Wallet.legacyAddresses().filter(a => !a.archived);
  $scope.targets = accounts.concat(addresses).map(format.origin);

  $scope.activeCount = (
    Wallet.accounts().filter(a => !a.archived).length +
    Wallet.legacyAddresses().filter(a => !a.archived).length
  );

  $scope.setActive = () => {
    let t = $scope.target;
    $scope.active = t.index != null ? t.xpub : t.address;
  };

  for (let i = 0; i < $scope.targets.length; i++) {
    if (i === parseInt(activeIndex, 10)) {
      $scope.target = $scope.targets[i];
      $scope.setActive();
      break;
    }
  }

  $scope.action = $sce.trustAsResourceUrl(`${$scope.rootURL}export-history`);
  $scope.format = 'dd/MM/yyyy';

  $scope.exportFormat = 'csv';
  $scope.start = { date: Date.now() - 604800000 };
  $scope.end = { date: Date.now() };
}
