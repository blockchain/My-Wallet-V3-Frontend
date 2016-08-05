angular
  .module('walletApp')
  .controller('AccountFormCtrl', AccountFormCtrl);

function AccountFormCtrl ($scope, $q, $uibModalInstance, Wallet, Alerts, account) {
  $scope.accounts = Wallet.accounts;
  $scope.status = {};
  $scope.isNameUnused = (name) => $scope.accounts().every(a => a.label !== name);

  if (account != null) {
    $scope.name = account.label;
    $scope.status.edit = true;
  }

  $scope.createAccount = () => {
    if (!Wallet.my.browserCheck()) {
      Alerts.displayError('UNSUITABLE_BROWSER', true);
      return $uibModalInstance.close();
    }

    let done = () => {
      $scope.status.busy = false;
      $scope.$safeApply();
    };

    $scope.status.busy = true;
    Wallet.createAccount($scope.name, () => $uibModalInstance.dismiss(), done, done);
  };

  $scope.updateAccount = () => {
    $scope.status.busy = true;
    $q(Wallet.renameAccount.bind(null, account, $scope.name))
      .then(() => $uibModalInstance.dismiss(''))
      .finally(() => $scope.status.busy = false);
  };

  $scope.submit = () => $scope.status.edit
    ? $scope.updateAccount()
    : $scope.createAccount();
}
