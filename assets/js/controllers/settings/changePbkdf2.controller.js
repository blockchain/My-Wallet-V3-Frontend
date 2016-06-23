angular
  .module('walletApp')
  .controller('ChangePbkdf2Ctrl', ChangePbkdf2Ctrl);

function ChangePbkdf2Ctrl ($scope, Wallet, $translate, Alerts) {
  $scope.settings = Wallet.settings;
  $scope.status = {};
  $scope.form = {};

  $scope.fields = {
    pbkdf2: ''
  };

  $scope.reset = () => {
    $scope.fields = {
      pbkdf2: ''
    };
  };

  $scope.setPbkdf2 = () => {
    const error = () => {
      Alerts.displayError('Failed to update PBKDF2 iterations');
      $scope.status = {};
    };

    const success = () => {
      Wallet.saveActivity(2);
      $scope.deactivate();
    };

    $scope.status.waiting = true;
    Wallet.setPbkdf2Iterations($scope.fields.pbkdf2, success, error);
  };
}
