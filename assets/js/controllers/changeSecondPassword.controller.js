angular
  .module('walletApp')
  .controller('ChangeSecondPasswordCtrl', ChangeSecondPasswordCtrl);

function ChangeSecondPasswordCtrl ($scope, Wallet, $timeout, MyWallet) {
  $scope.form = {};
  $scope.fields = {
    password: '',
    confirmation: ''
  };

  try { $scope.userHasExchangeAcct = MyWallet.wallet.external.coinify.user; } catch (e) {}

  $scope.reset = () => {
    $scope.fields = {
      password: '',
      confirmation: ''
    };
  };

  $scope.removeSecondPassword = () => {
    if ($scope.status.waiting) return;
    $scope.status.waiting = true;
    let done = () => $scope.status.waiting = false;
    Wallet.removeSecondPassword(done, done);
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
