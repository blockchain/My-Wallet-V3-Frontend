angular
  .module('walletApp')
  .controller('VerifyMessageController', VerifyMessageController);

function VerifyMessageController ($scope, MyWalletHelpers, Alerts) {
  $scope.alerts = [];
  $scope.isBitcoinAddress = MyWalletHelpers.isBitcoinAddress;
  $scope.isBase64 = MyWalletHelpers.isBase64;

  $scope.verify = () => {
    try {
      Alerts.clear($scope.alerts);
      $scope.verified = MyWalletHelpers.verifyMessage($scope.address, $scope.signature, $scope.message);
    } catch (e) {
      Alerts.displayError(e.message || e, false, $scope.alerts);
    }
  };

  $scope.$watch('address + signature + message', () => $scope.verified = null);
}
