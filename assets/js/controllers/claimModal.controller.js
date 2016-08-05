angular
  .module('walletApp')
  .controller('ClaimModalCtrl', ClaimModalCtrl);

function ClaimModalCtrl ($scope, Wallet, $translate, $uibModalInstance, claim, $rootScope) {
  $scope.accounts = Wallet.accounts;
  $scope.fields = {
    to: null
  };
  $scope.balance = null;
  $scope.redeeming = false;

  $scope.payment = new Wallet.Payment();

  claim.balance.then(balance => {
    $scope.balance = balance;
  });

  $scope.redeem = () => {
    const success = () => {
      $scope.redeeming = false;
      $uibModalInstance.dismiss('');
      $rootScope.scheduleRefresh();
    };
    const error = (e) => {
      console.log(e);
      $scope.redeeming = false;
      $scope.$digest();
    };
    $scope.redeeming = true;

    $scope.payment
      .from(claim.code)
      .to($scope.fields.to.index)
      .useAll()
      .build();

    const signAndPublish = (secondPassword) => {
      return $scope.payment.sign(secondPassword).publish().payment;
    };

    Wallet.askForSecondPasswordIfNeeded()
      .then(signAndPublish)
      .then(success).catch(error);
  };

  $scope.$watchCollection('accounts()', () => {
    $scope.fields.to = Wallet.accounts()[Wallet.getDefaultAccountIndex()];
  });
}
