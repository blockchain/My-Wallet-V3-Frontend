angular
  .module('walletApp')
  .controller('MobileConversionCtrl', MobileConversionCtrl);

function MobileConversionCtrl ($scope, MyWallet, Wallet, $uibModalInstance, medium, bcPhoneNumber, Alerts) {
  $scope.hideQR = true;
  $scope.medium = medium;
  $scope.pairingCode = null;
  $scope.accountInfo = MyWallet.wallet.accountInfo;
  $scope.user = Wallet.user;
  $scope.textSent = false;
  $scope.mobileExists = $scope.accountInfo.mobile ? true : false;

  $scope.format = bcPhoneNumber.format;

  $scope.ok = () => $uibModalInstance.close();

  $scope.done = () => {
    window.localStorage.hideMobileLink = true;
  };

  $scope.resendEmail = () => {
    console.log('resendEmail');
  };

  $scope.resendText = () => {
    console.log('resendText');
  };

  $scope.sendMobileLink = () => {
    if ($scope.medium === 'sms') {
      // send text message
      console.log('send sms w/', $scope.accountInfo.mobile);
      $scope.textSent = true;
    } else if ($scope.medium === 'email') {
      // send email
      console.log('send email w/', $scope.accountInfo.email);
      $scope.emailSent = true;
    } else {
      // produce err
    }
  }

  $scope.makeQR = () => {
    const success = (code) => {
      $scope.pairingCode = code;
      $scope.hideQR = false;
    };
    const error = (err) => {
      if (err === 'cancelled' || err === 'backdrop click') return;
      let msg = 'SHOW_PAIRING_CODE_FAIL';
      Alerts.displayError(msg);
    };

    Wallet.makePairingCode(success, error);
  };
  console.log('scope from mobile conversion ctrl', $scope, Wallet, MyWallet); //Wallet is my-wallet-v3, MyWallet is wallet.js in v3

  if ($scope.user.mobileNumber.length > 3) {
    $scope.hasMobile = true;
    $scope.sendMobileLink();
    // $scope.textSent = true;
  }
}
