angular
  .module('walletApp')
  .controller('RequestCtrl', RequestCtrl);

function RequestCtrl ($scope, AngularHelper, Wallet, Alerts, currency, $uibModalInstance, $log, destination, $translate, $stateParams, filterFilter, $filter, $q, format, smartAccount, Labels, $timeout, browser, Env, MyBlockchainApi) {
  Env.then(env => {
    $scope.rootURL = env.rootURL;
    $scope.isProduction = env.isProduction;
  });

  let isUsingPaymentRequestsExperiment = MyBlockchainApi.createExperiment(2);

  $scope.status = Wallet.status;
  $scope.settings = Wallet.settings;
  $scope.accounts = Wallet.accounts;
  $scope.legacyAddresses = Wallet.legacyAddresses;
  $scope.isBitCurrency = currency.isBitCurrency;
  $scope.format = currency.formatCurrencyForView;
  $scope.toSatoshi = currency.convertToSatoshi;
  $scope.fromSatoshi = currency.convertFromSatoshi;

  $scope.browser = browser;

  $scope.destinationLimit = 50;
  $scope.increaseLimit = () => $scope.destinationLimit += 50;

  $scope.state = {
    to: null,
    label: '',
    amount: null,
    viewQR: null,
    amountType: null,
    address: '',
    requestCreated: null
  };

  $scope.destinations = smartAccount.getOptions();
  $scope.state.to = destination || Wallet.my.wallet.hdwallet.defaultAccount;
  $scope.isToImportedAddress = () => $scope.state.to.type === 'Imported Addresses';

  $scope.didCopyManually = false;
  $scope.manuallyCopiedAddress = () => {
    if ($scope.didCopyManually) return;
    $scope.didCopyManually = true;
    isUsingPaymentRequestsExperiment.recordA();
  };

  $scope.nextStep = () => {
    if ($scope.isToImportedAddress()) $scope.state.requestCreated = true;
    else $scope.createPaymentRequest();
    isUsingPaymentRequestsExperiment.recordB();
  };

  $scope.createPaymentRequest = () => {
    $scope.lock();
    Alerts.clear();

    const success = () => $scope.state.requestCreated = true;

    const error = (error) => {
      if (error === 'NOT_ALPHANUMERIC') {
        $scope.requestForm.label.$error.characters = true;
      } else if (error === 'GAP') {
        $scope.requestForm.label.$error.gap = true;
      } else if (error === 'KV_LABELS_READ_ONLY') {
        Alerts.displayError('NEEDS_REFRESH');
      }
      $scope.requestForm.label.$valid = false;
    };

    let { label, to, amount } = $scope.state;

    if (Wallet.my.wallet.isMetadataReady) {
      $q.resolve(Labels.addLabel(to.index, 15, label, amount))
        .then(success).catch(error).finally($scope.free);
    } else {
      Wallet.askForSecondPasswordIfNeeded().then(pw => {
        Wallet.my.wallet.cacheMetadataKey.bind(Wallet.my.wallet)(pw).then(() => {
          Alerts.displayError('NEEDS_REFRESH');
        });
      });
    }
  };

  $scope.numberOfActiveAccountsAndLegacyAddresses = () => {
    const activeAccounts = filterFilter(Wallet.accounts(), {archived: false});
    const activeAddresses = filterFilter(Wallet.legacyAddresses(), {archived: false});
    return activeAccounts.length + activeAddresses.length;
  };

  $scope.address = () => {
    if (!$scope.status.didInitializeHD) return null;

    if (($scope.state.to != null) && ($scope.state.to.address != null)) {
      return $scope.state.to.address;
    } else if ($scope.status.didInitializeHD) {
      let idx = $scope.state.to.index;
      return Wallet.getReceivingAddressForAccount(idx);
    }
  };

  $scope.paymentRequestURL = (isBitcoinURI) => {
    let root = $scope.isProduction ? 'https://blockchain.info/' : $scope.rootURL;
    let { amount, label, address, amountType, baseCurr } = $scope.state;
    let { currency, btcCurrency } = $scope.settings;
    let url;

    if (isBitcoinURI) url = 'bitcoin:' + address + '?';
    else url = root + 'payment_request?' + 'address=' + address + '&';

    if (isBitcoinURI) url += amount ? 'amount=' + $scope.fromSatoshi(amount || 0, btcCurrency) + '&' : '';
    else url += amount ? amountType + '=' + $scope.fromSatoshi(amount || 0, baseCurr) + '&' : '';

    if (!isBitcoinURI && amountType === 'amount_local') url += 'currency=' + currency.code + '&nosavecurrency=true&';

    url += label ? 'message=' + label + ' ' : '';
    return encodeURI(url.slice(0, -1));
  };

  $scope.$watch('state.to', () => $scope.state.address = $scope.address());

  AngularHelper.installLock.call($scope);
}
