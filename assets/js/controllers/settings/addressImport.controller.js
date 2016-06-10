angular
  .module('walletApp')
  .controller('AddressImportCtrl', AddressImportCtrl);

function AddressImportCtrl ($scope, $uibModal, Wallet, Alerts, $uibModalInstance, $state, $timeout) {
  $scope.settings = Wallet.settings;
  $scope.accounts = Wallet.accounts;
  $scope.alerts = [];
  $scope.address = null;
  $scope.BIP38 = false;
  $scope.step = 1;

  $scope.status = {};
  $scope.fields = { addressOrPrivateKey: '', bip38passphrase: '', account: null };

  $scope.$watchCollection('accounts()', (newValue) => {
    $scope.fields.account = Wallet.accounts()[Wallet.my.wallet.hdwallet.defaultAccountIndex];
  });

  $scope.isValidAddressOrPrivateKey = (val) => {
    return Wallet.isValidAddress(val) || Wallet.isValidPrivateKey(val);
  };

  $scope.goToTransfer = () => {
    $uibModalInstance.close();
    $uibModal.open({
      templateUrl: 'partials/settings/transfer.jade',
      controller: 'TransferController',
      windowClass: 'bc-modal',
      resolve: { address: () => $scope.address }
    });
  };

  $scope.parseBitcoinUrl = (url) => url.replace('bitcoin:', '').replace(/\//g, '');

  $scope.onAddressScan = (url) => {
    $scope.fields.addressOrPrivateKey = $scope.parseBitcoinUrl(url);
    let valid = $scope.isValidAddressOrPrivateKey($scope.fields.addressOrPrivateKey);
    $scope.importForm.privateKey.$setValidity('isValid', valid);
  };

  $scope.import = () => {
    $scope.status.busy = true;
    $scope.$safeApply();
    let addressOrPrivateKey = $scope.fields.addressOrPrivateKey.trim();
    let bip38passphrase = $scope.fields.bip38passphrase.trim();

    const success = (address) => {
      $scope.status.busy = false;
      $scope.address = address;
      $scope.step = 2;
      $scope.$safeApply();
    };

    const error = (err) => {
      $scope.status.busy = false;
      $scope.$safeApply();

      switch (err.message) {
        case 'presentInWallet':
          $scope.importForm.privateKey.$setValidity('present', false);
          $scope.BIP38 = false;
          break;
        case 'wrongBipPass':
          $scope.importForm.bipPassphrase.$setValidity('wrong', false);
          break;
        case 'importError':
          $scope.importForm.privateKey.$setValidity('check', false);
          $scope.step = 1;
          $scope.BIP38 = false;
          $scope.proceedWithBip38 = undefined;
          break;
      }
    };

    const needsBipPassphrase = (proceed) => {
      $scope.status.busy = false;
      $scope.proceedWithBip38 = proceed;
      $timeout(() => { $scope.BIP38 = true; });
    };

    const cancel = () => {
      $scope.status.busy = false;
      $scope.$safeApply();
    };

    const attemptImport = Wallet.addAddressOrPrivateKey.bind(null,
      addressOrPrivateKey, needsBipPassphrase, success, error, cancel);

    $timeout(() => {
      if (!$scope.BIP38) {
        if (Wallet.isValidAddress(addressOrPrivateKey)) {
          Alerts.confirm('CONFIRM_IMPORT_WATCH')
            .then(attemptImport)
            .finally(() => $scope.status.busy = false);
        } else {
          attemptImport();
        }
      } else {
        $scope.proceedWithBip38(bip38passphrase);
      }
    }, 250);
  };

  $scope.close = () => {
    if ($scope.step === 2 && $scope.address.balance > 0 && !$scope.address.isWatchOnly) {
      var opts = {'action': 'goToTransfer', 'translation': 'TRANSFER'};
      Alerts.confirm('CONFIRM_NOT_SWEEP', {}, '', 'DONT_TRANSFER', opts)
        .then($scope.goToTransfer).catch($uibModalInstance.dismiss);
    } else {
      $uibModalInstance.dismiss('');
    }
  };
}
