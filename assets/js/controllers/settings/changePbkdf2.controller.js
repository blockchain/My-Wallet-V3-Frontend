angular
  .module('walletApp')
  .controller('ChangePbkdf2Ctrl', ChangePbkdf2Ctrl);

function ChangePbkdf2Ctrl ($scope, Wallet, $translate, Alerts) {
  $scope.reset = () => {
    $scope.fields = { pbkdf2: Wallet.settings.pbkdf2 };
  };

  $scope.setPbkdf2 = () => {
    let error = () => Alerts.displayError('Failed to update PBKDF2 iterations');
    $scope.status.waiting = true;
    Wallet.setPbkdf2Iterations($scope.fields.pbkdf2, $scope.deactivate, error);
  };
}
