angular
  .module('walletApp')
  .controller('VerifyMessageController', VerifyMessageController);

function VerifyMessageController($scope, MyWalletHelpers) {
  $scope.isBitcoinAddress = MyWalletHelpers.isBitcoinAddress;
  $scope.isBase64 = MyWalletHelpers.isBase64;

  $scope.verify = () => {
    $scope.verified = MyWalletHelpers.verifyMessage($scope.address, $scope.signature, $scope.message);
    $scope.didVerify = true;
  };
}
