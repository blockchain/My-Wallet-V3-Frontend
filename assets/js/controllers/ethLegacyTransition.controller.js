angular
  .module('walletApp')
  .controller('EthLegacyTransitionController', EthLegacyTransitionController);

function EthLegacyTransitionController ($scope, $uibModalInstance, Alerts, Ethereum, maxAvailable) {
  $scope.address = Ethereum.defaultAccount.address;
  $scope.amount = maxAvailable.amount;
  $scope.fee = maxAvailable.fee;

  $scope.confirm = () => {
    Ethereum.transitionFromLegacy().then(
    Ethereum.sweepLegacyAccount())
            .then($uibModalInstance.close)
            .catch((err) => Alerts.displayError(err));
  };
}
