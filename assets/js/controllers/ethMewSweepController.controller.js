angular
  .module('walletApp')
  .controller('EthMewSweepController', EthMewSweepController);

function EthMewSweepController ($q, $scope, Alerts, Ethereum, AngularHelper, Upload, Wallet) {
  let reader = new FileReader();
  AngularHelper.installLock.call($scope);
  $scope.form = {};

  let parseInput = (input) => {
    if (typeof input === 'string') {
      return input.toLowerCase();
    } else {
      throw new Error('Input type not supported');
    }
  };

  $scope.$watch('file', (newVal) => {
    reader.onloadend = (evt) => {
      if (evt.target.readyState === 2) {
        try {
          let input = parseInput(evt.target.result);
          $scope.keystore = JSON.parse(input);
          $scope.fileError = null;
        } catch (e) {
          $scope.keystore = null;
          $scope.fileError = e;
        }
      }
    };
    newVal && reader.readAsText(newVal);
  });

  let submitTx = (account) => {
    if (!account) { throw new Error('Ethereum account needed'); }
    if (!account.isCorrectPrivateKey(account.privateKey)) { throw new Error('Incorrect Private Key'); }

    $q.all([account.fetchBalance(), Ethereum.fetchFees()]).then(([balance, fees]) => {
      $scope.payment = account.createPayment();
      $scope.payment.setGasPrice(fees.regular);
      $scope.payment.setGasLimit(fees.gasLimit);
      $scope.payment.setSweep();
      $scope.payment.setTo(Ethereum.defaultAccount.address);
      let privateKey = account.privateKey;
      $scope.payment.sign(privateKey);
      return $scope.payment.publish().then(() => {
        $scope.$dismiss();
        Wallet.api.incrementEventStat('mew_sweep_success');
        Alerts.displaySentBitcoin('ETHER_SEND_SUCCESS_MEW');
      }).catch((e) => {
        $scope.free();
        if (e.message.toLowerCase().indexOf('insufficient funds') > -1) Alerts.displayError('MEW.fund_error');
        else Alerts.displayError(e.message);
      });
    });
  };

  $scope.submit = () => {
    $scope.lock();
    if ($scope.fileError) {
      Alerts.displayError('There was a problem with your file.');
      return false;
    }
    if (!$scope.keystore) {
      Alerts.displayError('File required.');
      return false;
    }
    try {
      let account = Ethereum.eth.fromMew($scope.keystore, $scope.password);
      submitTx(account);
    } catch (err) {
      $scope.free();
      Alerts.displayError(err.message);
    }
  };
}
