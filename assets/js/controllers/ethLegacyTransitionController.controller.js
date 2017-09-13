angular
  .module('walletApp')
  .controller('EthLegacyTransitionController', EthLegacyTransitionController);

function EthLegacyTransitionController ($scope, $uibModalInstance, AngularHelper, Alerts, Ethereum) {
  this.initialized = () => {
    this.from = Ethereum.legacyAccount.address;
    this.to = Ethereum.defaultAccount ? Ethereum.defaultAccount.address : 'My Ether Wallet';
    Ethereum.legacyAccount.getAvailableBalance().then(maxAvailable => {
      this.amount = maxAvailable.amount;
      this.fee = maxAvailable.fee;
    });
  };

  this.confirm = () => {
    this.lock();
    Ethereum.sweepLegacyAccount().then(({ txHash }) => {
      $uibModalInstance.close();
      console.log('sent ether:', txHash);
      Alerts.displaySentBitcoin('ETHER_SEND_SUCCESS');
      Ethereum.recordLastTransaction(txHash);
    }).catch(({ message }) => {
      this.free();
      Alerts.displayError(message);
    });
  };

  $scope.$watch(
    () => Ethereum.legacyAccount != null,
    (init) => init && this.initialized()
  );

  AngularHelper.installLock.call(this);
}
