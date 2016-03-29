angular
  .module('walletApp')
  .controller("AddressImportCtrl", AddressImportCtrl);

function AddressImportCtrl($scope, $log, Wallet, Alerts, $uibModalInstance, $translate, $state, $timeout, address, $rootScope) {
  $scope.settings = Wallet.settings;
  $scope.accounts = Wallet.accounts;
  $scope.alerts = [];
  $scope.address = address;
  $scope.step = address ? 3 : 1;
  $scope.BIP38 = false;
  $scope.status = {
    busy: false,
    sweeping: false,
    cameraIsOn: false
  };
  $scope.fields = {
    addressOrPrivateKey: '',
    bip38passphrase: '',
    account: null
  };

  $scope.$watchCollection("accounts()", (newValue) => {
    $scope.fields.account = Wallet.accounts()[Wallet.my.wallet.hdwallet.defaultAccountIndex];
  });

  $scope.isValidAddressOrPrivateKey = (val) => {
    return Wallet.isValidAddress(val) || Wallet.isValidPrivateKey(val);
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

      switch (err) {
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

    $timeout(() => {
      if(!$scope.BIP38) {
        Wallet.addAddressOrPrivateKey(
          addressOrPrivateKey, needsBipPassphrase, success, error, cancel
        );
      } else {
        $scope.proceedWithBip38(bip38passphrase);
      }
    }, 250);
  };

  $scope.transfer = () => {
    $scope.status.sweeping = true;

    const success = () => {
      $scope.status.sweeping = false;
      $uibModalInstance.dismiss("");
      $rootScope.scheduleRefresh();
      $state.go("wallet.common.transactions", {
        accountIndex: $scope.fields.account.index
      });
      $translate(['SUCCESS', 'BITCOIN_SENT']).then(function(translations) {
        $scope.$emit('showNotification', {
          type: 'sent-bitcoin',
          icon: 'bc-icon-send',
          heading: translations.SUCCESS,
          msg: translations.BITCOIN_SENT
        });
      });
    };

    const error = (error) => {
      $scope.status.sweeping = false;
      if (error && typeof error === 'string') {
        Alerts.displayError(error, false, $scope.alerts);
      } else {
        console.log(error);
        $translate("SWEEP_FAILED").then((translation) => {
          Alerts.displayError(translation, false, $scope.alerts);
        });
      }
      $scope.$root.$safeApply($scope);
    };

    let payment = new Wallet.payment();
    payment
      .from($scope.address.address)
      .to($scope.fields.account.index)
      .sweep().build();

    const signAndPublish = (passphrase) => {
      return payment.sign(passphrase).publish().payment;
    };

    Wallet.askForSecondPasswordIfNeeded()
      .then(signAndPublish).then(success).catch(error);
  };

  $scope.goToTransfer = () => {
    $scope.step = 3;
  };

  $scope.onError = (error) => {
    $translate("CAMERA_PERMISSION_DENIED").then(function(translation) {
      Alerts.displayWarning(translation, false, $scope.alerts);
    });
  };

  $scope.cameraOn = () => {
    $scope.cameraRequested = true;
  };

  $scope.cameraOff = () => {
    $scope.status.cameraIsOn = false;
    $scope.cameraRequested = false;
    $scope.$broadcast("STOP_WEBCAM");
  };

  $scope.onAddressScan = (url) => {
    $scope.fields.addressOrPrivateKey = $scope.parseBitcoinUrl(url);
    $scope.cameraOff();
    let valid = $scope.isValidAddressOrPrivateKey($scope.fields.addressOrPrivateKey);
    $scope.importForm.privateKey.$setValidity('isValid', valid);
  };

  $scope.parseBitcoinUrl = (url) => {
    return url.replace('bitcoin:', '').replace(/\//g, '');
  };

  $scope.close = () => {
    if ($scope.step == 2 && $scope.address.balance > 0 && !$scope.address.isWatchOnly) {
      Alerts.confirm('CONFIRM_NOT_SWEEP', {}, '', 'DONT_SWEEP').then($uibModalInstance.dismiss);
    } else {
      $uibModalInstance.dismiss("");
    }
  };

}
