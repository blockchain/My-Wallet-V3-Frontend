angular
  .module('walletApp')
  .controller('EthLegacyTransitionController', EthLegacyTransitionController);

function EthLegacyTransitionController ($scope, $uibModalInstance, AngularHelper, Alerts, Ethereum) {
  $scope.initialized = () => {
    $scope.from = Ethereum.legacyAccount.address;
    $scope.to = Ethereum.defaultAccount ? Ethereum.defaultAccount.address : 'My Ether Wallet';
    Ethereum.legacyAccount.getAvailableBalance().then(maxAvailable => {
      $scope.amount = maxAvailable.amount;
      $scope.fee = maxAvailable.fee;
    });
  };

  $scope.confirm = () => {
    $scope.lock();
    Ethereum.sweepLegacyAccount().then(({ txHash }) => {
      $uibModalInstance.close();
      console.log('sent ether:', txHash);
      Alerts.displaySentBitcoin('ETHER_SEND_SUCCESS');
      Ethereum.recordLastTransaction(txHash);
    }).catch(({ message }) => {
      $scope.free();
      Alerts.displayError(message);
    });
  };

  $scope.$watch(
    () => Ethereum.legacyAccount != null,
    (init) => init && $scope.initialized()
  );

  AngularHelper.installLock.call($scope);
}
