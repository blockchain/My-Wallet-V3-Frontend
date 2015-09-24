angular
  .module('walletApp')
  .controller("SetSecondPasswordCtrl", SetSecondPasswordCtrl);

function SetSecondPasswordCtrl($scope, $log, Wallet, $modalInstance, $translate, $timeout) {
  $scope.isValid = false;
  $scope.busy = null;
  $scope.fields = {
    password: "",
    confirmation: ""
  };

  $scope.close = () => {
    Wallet.clearAlerts();
    $modalInstance.dismiss("");
  };

  $scope.setPassword = () => {
    if ($scope.busy || !$scope.isValid) return;
    $scope.busy = true;
    $scope.$root.$safeApply($scope);

    const success = () => {
      $scope.busy = false;
      $modalInstance.dismiss("");
      Wallet.saveActivity(2);
    };

    $timeout(() => {
      Wallet.setSecondPassword($scope.fields.password, success);
    }, 500);
  };

  $scope.$watch("fields.confirmation", (newVal) => {
    if (newVal != null) $scope.validate(false);
  });

  $scope.validate = (visual) => {
    if (visual == null) visual = true;
    let isValid = true;
    $scope.errors = {
      password: null,
      confirmation: null
    };
    $scope.success = {
      password: false,
      confirmation: false
    };

    if ($scope.fields.password === "") {
      isValid = false;
    } else {
      if ($scope.fields.password.length > 3) {
        $scope.success.password = true;
      } else {
        isValid = false;
        if (visual) {
          $translate("TOO_SHORT").then((translation) => {
            $scope.errors.password = translation;
          });
        }
      }
    }
    if ($scope.fields.confirmation === "") {
      isValid = false;
    } else {
      if ($scope.fields.confirmation === $scope.fields.password) {
        $scope.success.confirmation = true;
      } else {
        isValid = false;
        if (visual) {
          $translate("NO_MATCH").then((translation) => {
            $scope.errors.confirmation = translation;
          });
        }
      }
    }
    $scope.isValid = isValid;
  };

  $scope.validate();

}
