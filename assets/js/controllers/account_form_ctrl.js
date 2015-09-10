walletApp.controller("AccountFormCtrl", ($scope, Wallet, $modalInstance, $log, $translate, account, $modal) => {
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

  $scope.close = () => {$modalInstance.dismiss("")};

  $scope.createAccount = () => {

    $scope.status.busy = true;

    const success = () => {
      $scope.status.busy = false;
      $modalInstance.dismiss("");
      Wallet.saveActivity(3);
      $translate(['SUCCESS', 'ACCOUNT_CREATED']).then(translations => {
        $scope.$emit('showNotification', {
          type: 'created-account',
          icon: 'ti-layout-list-post',
          heading: translations.SUCCESS,
          msg: translations.ACCOUNT_CREATED
        });
      });
    };

    const error = () => {$scope.status.busy = false;}

    const cancel = () => {$scope.status.busy = false;}

    Wallet.createAccount($scope.fields.name, success, error, cancel);
  };

  $scope.updateAccount = () => {
    $scope.status.busy = true;
    const success = () => {
      $scope.status.busy = false;
      $modalInstance.dismiss("");
      Wallet.saveActivity(3);
    };

    const error = () => {$scope.status.busy = false;}
    
    Wallet.renameAccount(account, $scope.fields.name, success, error);
  };

  $scope.isNameUnused = name => {
    return !($scope.accounts().some(e => e.label === name));
  };
});
