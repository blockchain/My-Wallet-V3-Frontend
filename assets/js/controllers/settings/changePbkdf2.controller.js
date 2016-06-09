angular
  .module('walletApp')
  .controller('ChangePbkdf2Ctrl', ChangePbkdf2Ctrl);

function ChangePbkdf2Ctrl ($scope, Wallet, $translate, Alerts) {
  $scope.settings = Wallet.settings;

  $scope.fields = {
    pbkdf2: ''
  };

  $scope.errors = {};
  $scope.status = {};
  $scope.active = false;

  $scope.reset = () => {
    $scope.fields = {
      pbkdf2: ''
    };

    $scope.errors = {};
    $scope.status = {};
    $scope.active = false;

    $scope.form.$setPristine();
    $scope.form.$setUntouched();
    $scope.$root.$safeApply($scope);
  };

  $scope.activate = () => {
    $scope.active = true;
  };

  $scope.deactivate = () => {
    $scope.active = false;
    $scope.reset();
  };

  $scope.validatePbkdf2 = () => {
    let candidate = $scope.fields.pbkdf2;

    let n = parseInt(candidate, 10);
    if (n <= 1) {
      $translate('PBKDF2_GREATER_THAN_1').then((t) => $scope.errors.pbkdf2 = t);
    } else if (n >= 20000) {
      $translate('PBKDF2_LESS_THAN_20000').then((t) => $scope.errors.pbkdf2 = t);
    } else {
      $scope.errors.pbkdf2 = '';
    }
  };

  $scope.changePbkdf2 = () => {
    $scope.status.waiting = true;

    const error = () => {
      Alerts.displayError('Failed to update PBKDF2 iterations');
      $scope.status = {};
    };

    const success = () => {
      Wallet.saveActivity(2);
      $scope.reset();
    };

    Wallet.setPbkdf2Iterations($scope.fields.pbkdf2, success, error);
  };
}
