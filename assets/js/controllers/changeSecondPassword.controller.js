angular
  .module('walletApp')
  .controller('ChangeSecondPasswordCtrl', ChangeSecondPasswordCtrl);

function ChangeSecondPasswordCtrl ($scope, Wallet, $timeout) {
  $scope.busy = null;
  $scope.fields = {
    password: '',
    confirmation: ''
  };
  $scope.active = false;

  $scope.removeSecondPassword = () => {
    if ($scope.busy) return;
    $scope.busy = true;
    let done = () => $scope.busy = false;
    Wallet.removeSecondPassword(done, done);
  };

  $scope.reset = () => {
    $scope.fields = {
      password: '',
      confirmation: ''
    };
    $scope.busy = false;
    $scope.active = false;

    $scope.passwordForm.$setPristine();
    $scope.passwordForm.$setUntouched();
    $scope.$root.$safeApply($scope);
  };

  $scope.activate = () => {
    $scope.active = true;
  };

  $scope.deactivate = () => {
    $scope.active = false;
  };

  $scope.isMainPassword = Wallet.isCorrectMainPassword;

  $scope.isPasswordHint = (candidate) => {
    return Wallet.user.passwordHint && candidate === Wallet.user.passwordHint;
  };

  $scope.setPassword = () => {
    if ($scope.busy || $scope.form.$invalid) return;
    $scope.busy = true;
    $scope.$safeApply();

    const success = () => { $scope.reset(); };

    $timeout(() => {
      Wallet.setSecondPassword($scope.fields.password, success);
    }, 500);
  };
}
