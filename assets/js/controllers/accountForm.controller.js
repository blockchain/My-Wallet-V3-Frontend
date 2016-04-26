angular
  .module('walletApp')
  .controller('AccountFormCtrl', AccountFormCtrl);

function AccountFormCtrl ($scope, Wallet, $uibModalInstance, $log, $translate, account) {
  $scope.accounts = Wallet.accounts;

  $scope.fields = {
    name: ''
  };

  $scope.status = {
    edit: false,
    busy: null
  };

  if (account != null) {
    $scope.fields.name = account.label;
    $scope.status.edit = true;
  }

  $scope.close = () => $uibModalInstance.dismiss('');

  $scope.createAccount = () => {
    $scope.status.busy = true;

    const success = () => {
      $scope.status.busy = false;
      $uibModalInstance.dismiss('');
      Wallet.saveActivity(3);
    };

    const error = () => $scope.status.busy = false;

    const cancel = () => $scope.status.busy = false;

    Wallet.createAccount($scope.fields.name, success, error, cancel);
  };

  $scope.updateAccount = () => {
    $scope.status.busy = true;
    const success = () => {
      $scope.status.busy = false;
      $uibModalInstance.dismiss('');
      Wallet.saveActivity(3);
    };

    const error = () => $scope.status.busy = false;

    Wallet.renameAccount(account, $scope.fields.name, success, error);
  };

  $scope.isNameUnused = name => {
    return !($scope.accounts().some(e => e.label === name));
  };
}
