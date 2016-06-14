angular
  .module('walletApp')
  .controller('ExportHistoryController', ExportHistoryController);

function ExportHistoryController ($scope, $sce, $translate, format, Wallet, MyWallet, activeIndex) {
  let accounts = Wallet.accounts().filter(a => !a.archived && a.index != null);
  let addresses = Wallet.legacyAddresses().filter(a => !a.archived);

  let allHD = {
    type: $translate.instant('ALL'),
    label: $translate.instant('HD_ADDRESSES'),
    address: accounts.map(a => a.extendedPublicKey).join('|')
  };

  let allAddresses = {
    type: $translate.instant('ALL'),
    label: $translate.instant('IMPORTED_ADDRESSES'),
    address: addresses.map(a => a.address).join('|')
  };

  $scope.targets = [allHD, allAddresses].concat(accounts.concat(addresses).concat(allAddresses).map(format.origin));

  $scope.activeCount = (
    Wallet.accounts().filter(a => !a.archived).length +
    Wallet.legacyAddresses().filter(a => !a.archived).length
  );

  $scope.setActive = () => {
    let t = $scope.target;
    $scope.active = t.index != null ? t.xpub : t.address;
  };

  if (activeIndex === '') {
    $scope.target = allHD;
  } else if (activeIndex === 'imported') {
    $scope.target = allAddresses;
  } else if (!isNaN(activeIndex)) {
    for (let i = 0; i < $scope.targets.length; i++) {
      let target = $scope.targets[i];
      if (target.index === parseInt(activeIndex, 10)) {
        $scope.target = target;
        break;
      }
    }
  }

  if ($scope.target) {
    $scope.setActive();
  }

  $scope.action = $sce.trustAsResourceUrl(`${$scope.rootURL}export-history`);
  $scope.format = 'dd/MM/yyyy';

  $scope.exportFormat = 'csv';
  $scope.start = { date: Date.now() - 604800000 };
  $scope.end = { date: Date.now() };
}
