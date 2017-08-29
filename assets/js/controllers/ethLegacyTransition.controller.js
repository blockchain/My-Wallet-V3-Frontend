angular
  .module('walletApp')
  .controller('EthLegacyTransitionController', EthLegacyTransitionController);

function EthLegacyTransitionController ($scope, $uibModalInstance, Alerts, Ethereum) {
  $scope.initialized = () => {
    $scope.from = Ethereum.legacyAccount.address;
    $scope.to = Ethereum.defaultAccount ? Ethereum.defaultAccount.address : 'My Ether Wallet';
    Ethereum.legacyAccount.getAvailableBalance().then(maxAvailable => {
      $scope.amount = maxAvailable.amount;
      $scope.fee = maxAvailable.fee;
    });
  };

  $scope.confirm = () => {
    Ethereum.sweepLegacyAccount().then(({ txHash }) => {
      $uibModalInstance.close();
      console.log('sent ether:', txHash);
      Alerts.displaySentBitcoin('ETHER_SEND_SUCCESS');
      Ethereum.recordLastTransaction(txHash);
    }).catch(({ message }) => {
      Alerts.displayError(message);
    });
  };

  $scope.$watch(
    () => Ethereum.legacyAccount != null,
    (init) => init && $scope.initialized()
  );
}
