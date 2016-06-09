angular
  .module('walletApp')
  .controller('ChangePasswordHintCtrl', ChangePasswordHintCtrl);

function ChangePasswordHintCtrl ($rootScope, $scope, Wallet, $translate) {
  $scope.form = {};
  $scope.fields = {
    passwordHint: ''
  };

  $scope.reset = () => {
    $scope.fields = {
      passwordHint: ''
    };
  };

  $scope.changePasswordHint = () => {
    if (!$scope.form.$valid) return;

    const success = () => {
      Wallet.saveActivity(2);
      $scope.deactivate();
    };

    const error = (err) => {
      $scope.status = {};
      let errors = [
        'PASSWORD_HINT_ERROR',
        'PASSWORD_HINT_NOPASSWORD',
        'PASSWORD_HINT_NOPASSWORD2',
        'CHANGE_PASSWORD_FAILED'
      ];
      $translate(errors).then((translations) => {
        switch (err) {
          case 101:
            $scope.errors.passwordHint = translations.PASSWORD_HINT_ERROR;
            break;
          case 102:
            $scope.errors.passwordHint = translations.PASSWORD_HINT_NOPASSWORD;
            break;
          case 103:
            $scope.errors.passwordHint = translations.PASSWORD_HINT_NOPASSWORD2;
            break;
          default:
            $scope.errors.passwordHint = translations.CHANGE_PASSWORD_FAILED;
        }
      });
    };

    $scope.status.waiting = true;
    Wallet.changePasswordHint($scope.fields.passwordHint, success, error);
  };
}
