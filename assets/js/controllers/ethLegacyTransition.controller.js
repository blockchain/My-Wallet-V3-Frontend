angular
  .module('walletApp')
  .controller('EthLegacyTransitionController', EthLegacyTransitionController);

function EthLegacyTransitionController ($scope, $uibModalInstance, Alerts, Ethereum, maxAvailable) {
  $scope.from = Ethereum.defaultAccount.isCorrect ? Ethereum.legacyAccount.address : Ethereum.defaultAccount.address;
  $scope.to = Ethereum.defaultAccount.isCorrect ? Ethereum.defaultAccount.address : 'My Ether Wallet';
  $scope.amount = maxAvailable.amount;
  $scope.fee = maxAvailable.fee;

  $scope.confirm = () => {
    Ethereum.transitionFromLegacy().then(
    Ethereum.sweepLegacyAccount())
            .then($uibModalInstance.close)
            .catch((err) => Alerts.displayError(err));
  };
}
