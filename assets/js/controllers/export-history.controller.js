angular
  .module('walletApp')
  .controller('ExportHistoryController', ExportHistoryController);

function ExportHistoryController ($scope, $timeout, $translate, browser, format, DateHelper, Wallet, Alerts, ExportHistory, activeIndex, accts, coinCode) {
  // Private
  let compatibleBrowsers = browser.canDownloadFile;
  let currentBrowser = browserDetection().browser;
  let accounts = accts ? accts.accounts : Wallet.accounts().filter(a => !a.archived && a.index !== null);
  let addresses = accts ? accts.addresses : Wallet.legacyAddresses().filter(a => !a.archived).map(a => a.address);
  let all_accounts = {
    index: '',
    label: $translate.instant(coinCode + '.ALL_WALLETS'),
    address: accounts.map(a => a.extendedPublicKey || a.xpub).concat(addresses)
  };
  let imported_addresses = {
    index: 'imported',
    label: $translate.instant(coinCode + '.IMPORTED_ADDRESSES'),
    address: addresses
  };
  let startDate = DateHelper.round(DateHelper.subtractDays(DateHelper.now(), 7));
  let endDate = DateHelper.round(DateHelper.now());
  let convertToDashed = (date) => { return DateHelper.toCustomShortDate('-', date); };
  let convertToSlashed = (date) => { return DateHelper.toCustomShortDate('/', date); };

  // Public
  let vm = this;
  vm.limit = 50;
  vm.coinCode = coinCode;
  vm.incLimit = () => vm.limit += 50;
  vm.canTriggerDownload = compatibleBrowsers.indexOf(currentBrowser) > -1;
  vm.format = DateHelper.format.shortDate;

  vm.targets = [all_accounts].concat(accounts.map(format.origin));
  if (addresses && addresses.length) {
    vm.targets.push(imported_addresses);
  }

  vm.isLast = (t) => t === vm.targets[vm.limit - 1];
  vm.activeCount = accounts.length + (addresses && addresses.length);
  vm.active = vm.activeCount === 1 ? all_accounts : vm.targets.filter(t => t.index.toString() === activeIndex)[0];

  vm.options = {
    minDate: coinCode === 'btc' ? DateHelper.bitcoinStartDate : DateHelper.bitcoinCashStartDate,
    maxDate: DateHelper.now()
  };

  vm.start = {
    open: true,
    date: startDate
  };

  vm.end = {
    open: true,
    date: endDate
  };

  vm.filename = () => `history-${convertToDashed(vm.start.date)}-${convertToDashed(vm.end.date)}.csv`;

  vm.submit = () => {
    vm.busy = true;

    let activeAddress = vm.active.address || vm.active.xpub;

    ExportHistory.fetch(convertToSlashed(vm.start.date), convertToSlashed(vm.end.date), activeAddress, coinCode)
      .then((data) => {
        vm.history = data;
        vm.canTriggerDownload && $scope.$broadcast('download');
      })
      .catch((error) => {
        Alerts.displayError(error || 'UNKNOWN_ERROR');
      })
      .finally(() => vm.busy = false);
  };

  $scope.$watchGroup(['vm.start.date', 'vm.end.date'], () => {
    vm.history = null;
  });

    // need to open/close uib-datepicker-popup for it to validate minDate
  $timeout(() => {
    vm.start.open = vm.end.open = false;
  }, 100);
}
