angular
  .module('walletApp')
  .controller("AddressImportCtrl", AddressImportCtrl);

function AddressImportCtrl($scope, $log, Wallet, $modalInstance, $translate, $state, $timeout) {
  $scope.settings = Wallet.settings;
  $scope.accounts = Wallet.accounts;
  $scope.alerts = Wallet.alerts;
  $scope.address = null;
  $scope.step = 1;
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
    $scope.fields.account = Wallet.accounts()[0];
  });

  $scope.isValidAddressOrPrivateKey = (val) => {
    return Wallet.my.isValidAddress(val) || Wallet.my.isValidPrivateKey(val);
  };

  $scope.import = () => {
    $scope.status.busy = true;
    let addressOrPrivateKey = $scope.fields.addressOrPrivateKey.trim();
    let bip38passphrase = $scope.fields.bip38passphrase.trim();

    const success = (address) => {
      $scope.status.busy = false;
      $scope.address = address;
      $scope.step = 2;
    };

    const error = (err) => {
      $scope.status.busy = false;
      switch (err) {
        case 'presentInWallet':
          $scope.importForm.privateKey.$setValidity('present', false);
          break;
        case 'wrongBipPass':
          $scope.importForm.bipPassphrase.$setValidity('wrong', false);
          break;
      }
    };

    const needsBipPassphrase = (proceed) => {
      $scope.status.busy = false;
      $scope.BIP38 = true;
      $scope.proceedWithBip38 = proceed;
    };

    const cancel = () => {
      $scope.status.busy = false;
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
      $modalInstance.dismiss("");
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
        Wallet.displayError(error);
      }
      $scope.$root.$safeApply($scope);
    };

    let payment = new Wallet.payment();
    payment
      .from($scope.fields.address)
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
      Wallet.displayWarning(translation);
    });
  };

  $scope.cameraOn = () => {
    $scope.cameraRequested = true;
  };

  $scope.cameraOff = () => {
    $scope.status.cameraIsOn = false;
    $scope.cameraRequested = false;
  };

  $scope.processURLfromQR = (url) => {
    $scope.fields.addressOrPrivateKey = $scope.parseBitcoinUrl(url);
    $scope.cameraOff();
    let valid = $scope.isValidAddressOrPrivateKey($scope.fields.addressOrPrivateKey);
    $scope.importForm.privateKey.$setValidity('isValid', valid);
  };

  $scope.parseBitcoinUrl = (url) => {
    url = url.split('bitcoin:');
    url[url.length - 1];
  };

  $scope.close = () => {
    $modalInstance.dismiss("");
  };

}
