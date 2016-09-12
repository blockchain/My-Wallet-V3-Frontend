angular
  .module('walletApp')
  .controller('ManageSecondPasswordCtrl', ManageSecondPasswordCtrl);

function ManageSecondPasswordCtrl ($scope, Wallet, $timeout, MyWallet, $uibModal) {
  $scope.form = {};
  $scope.fields = {
    password: '',
    confirmation: ''
  };

  // TODO: add function to My-Wallet-V3 to check if the user has any exchange account:
  $scope.userHasExchangeAcct = MyWallet.wallet.external &&
                               MyWallet.wallet.external.coinify &&
                               MyWallet.wallet.external.coinify.user;

  $scope.reset = () => {
    $scope.fields = {
      password: '',
      confirmation: ''
    };
  };

  $scope.removeSecondPassword = () => {
    $uibModal.open({
      templateUrl: 'partials/settings/remove-second-password.jade',
      windowClass: 'bc-modal initial',
      controller: 'RemoveSecondPasswordCtrl'
    });
  };

  $scope.isMainPassword = Wallet.isCorrectMainPassword;

  $scope.isPasswordHint = (candidate) => {
    return Wallet.user.passwordHint && candidate === Wallet.user.passwordHint;
  };

  $scope.setPassword = () => {
    if ($scope.status.waiting || $scope.form.$invalid) return;
    $scope.$safeApply();

    const success = () => {
      $scope.deactivate();
    };

    $scope.status.waiting = true;
    Wallet.setSecondPassword($scope.fields.password, success);
  };
}
