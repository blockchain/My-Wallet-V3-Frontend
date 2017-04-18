angular
  .module('walletApp')
  .controller('ChangePbkdf2Ctrl', ChangePbkdf2Ctrl);

function ChangePbkdf2Ctrl ($scope, Wallet, $translate, Alerts) {
  $scope.reset = () => {
    $scope.fields = { pbkdf2: Wallet.settings.pbkdf2 };
  };

  $scope.setPbkdf2 = () => {
    let done = () => $scope.status.waiting = false;
    let error = () => { Alerts.displayError('Failed to update PBKDF2 iterations'); done(); };
    $scope.status.waiting = true;
    Wallet.setPbkdf2Iterations($scope.fields.pbkdf2, $scope.deactivate, error, done);
  };
}
