angular
  .module('walletApp')
  .controller('ExportHistoryController', ExportHistoryController);

function ExportHistoryController ($scope, $sce, MyWallet, activeIndex) {
  let active = [];
  if (!activeIndex) {
    active = MyWallet.wallet.context;
    $scope.activeName = 'All';
  } else if (activeIndex === 'imported') {
    active = MyWallet.wallet.activeAddresses;
    $scope.activeName = 'Imported Addresses';
  } else if (!isNaN(activeIndex)) {
    let acct = MyWallet.wallet.hdwallet.accounts[activeIndex];
    active = [acct.extendedPublicKey];
    $scope.activeName = acct.label;
  }

  $scope.action = $sce.trustAsResourceUrl(`${$scope.rootURL}export-history`);
  $scope.active = active.join('|');
  $scope.format = 'MM/dd/yyyy';

  $scope.start = { date: Date.now() - 604800000 };
  $scope.end = { date: Date.now() };
}
