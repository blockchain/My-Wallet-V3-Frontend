angular
  .module('walletApp')
  .controller('EthMewSweepController', EthMewSweepController);

function EthMewSweepController ($q, $scope, Alerts, Ethereum, AngularHelper, Upload) {
  let reader = new FileReader();
  AngularHelper.installLock.call($scope);
  $scope.form = {};

  $scope.$watch('file', (newVal) => {
    reader.onloadend = (evt) => {
      if (evt.target.readyState === 2) {
        $scope.keystore = evt.target.result;
      }
    };

    newVal && reader.readAsBinaryString(newVal.slice(0, newVal.size));
  });

  $scope.submit = () => {
    $scope.lock();
    try {
      $scope.account = Ethereum.eth.fromMew($scope.keystore, $scope.password, true);
      return $q.all([$scope.account.fetchBalance(), Ethereum.fetchFees()]).then(([balance, fees]) => {
        $scope.payment = $scope.account.createPayment();
        $scope.payment.setGasPrice(fees.regular);
        $scope.payment.setGasLimit(fees.gasLimit);
        $scope.payment.setSweep();
        $scope.payment.setTo(Ethereum.defaultAccount.address);
        let privateKey = $scope.account.privateKey;
        $scope.payment.sign(privateKey);
        return $scope.payment.publish().then(() => {
          $scope.$dismiss();
          Alerts.displaySentBitcoin('ETHER_SEND_SUCCESS');
        }).catch((e) => {
          $scope.free();
          Alerts.displayError(e.message);
        });
      });
    } catch (err) {
      $scope.free();
      Alerts.displayError(err.message);
    }
  };
}
