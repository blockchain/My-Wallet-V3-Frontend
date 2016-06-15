angular
  .module('walletApp')
  .controller('ChangePasswordCtrl', ChangePasswordCtrl);

function ChangePasswordCtrl ($scope, $log, Wallet, Alerts, $translate) {
  $scope.isCorrectMainPassword = Wallet.isCorrectMainPassword;
  $scope.uid = Wallet.user.uid;
  $scope.status = {};
  $scope.form = {};

  $scope.fields = {
    currentPassword: '',
    password: '',
    confirmation: ''
  };

  $scope.reset = () => {
    $scope.fields = {
      currentPassword: '',
      password: '',
      confirmation: ''
    };
  };

  $scope.isUserEmail = (candidate) => {
    return Wallet.user.email && candidate === Wallet.user.email;
  };

  $scope.isPasswordHint = (candidate) => {
    return Wallet.user.passwordHint && candidate === Wallet.user.passwordHint;
  };

  $scope.change = () => {
    if (!$scope.form.$valid) return;

    const success = () => {
      Wallet.saveActivity(2);
      $scope.deactivate();
    };

    const error = (err) => {
      $scope.status.waiting = false;
      $translate(err).then(msg => $scope.errors.unsuccessful = msg);
    };

    // $scope.status.waiting = true;
    Wallet.changePassword($scope.fields.password, success, error);
  };
}
