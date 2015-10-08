angular
  .module('walletApp')
  .controller("SignMessageCtrl", SignMessageCtrl);

function SignMessageCtrl($scope, $log, Wallet, $modalInstance, $translate) {

  $scope.legacyAddresses = Wallet.legacyAddresses;
  
  $scope.fields = {
    message: "",
    address: null
  };

  $scope.sign = () => {
    const success = (signature) => {
      $scope.signedMessage = signature;
    };

    Wallet.signMessage($scope.fields.address, $scope.fields.message, success);
  }
}
