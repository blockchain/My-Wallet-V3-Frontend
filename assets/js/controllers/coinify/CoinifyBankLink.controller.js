angular
  .module('walletApp')
  .controller('CoinifyBankLinkController', CoinifyBankLinkController);

function CoinifyBankLinkController ($scope, Alerts, buySell, $q) {
  $scope.transaction = $scope.$parent.transaction;
  $scope.bankAccounts = $scope.$parent.bankAccounts;

  $scope.selecting = true;

  $scope.$parent.$parent.selectedBankAccount = $scope.selectedBankAccount;

  $scope.bankLinkEdit = () => $scope.selecting = !$scope.selecting;

  $scope.bankNumView = (number) => {
    return number.slice(number.length - 6);
  };

  $scope.addBankAccount = () => {
    $scope.$parent.goTo('account-info');
  };

  const handleAccountAssignment = (account) => {
    let accounts = $scope.$parent.bankAccounts;
    for (let i = 0; i < accounts.length; i++) {
      if (accounts[i]['id'] === account['id']) accounts.splice(i, 1);
    }
    console.log('accounts', accounts);
    $scope.selecting = false;
    $scope.$parent.bankAccounts = accounts;
    $scope.bankAccounts = accounts;
    $scope.$parent.getBankAccounts();
    $scope.bankLinkEdit();
    if ($scope.bankAccounts.length === 0) {
      $scope.hideWhenNoAccounts = true;
    }
  };

  $scope.deleteAccount = (account) => {
    Alerts.confirm('CONFIRM_DELETE_BANK')
      .then(() => {
        $q.resolve(buySell.deleteBankAccount(account.id))
          .catch(e => console.error('Error deleting bank', e))
          .finally(handleAccountAssignment(account));
      });
  };

  $scope.$watch('selectedBankAccount', () => {
    $scope.$parent.$parent.selectedBankAccount = $scope.selectedBankAccount;
  });

  $scope.$watch('bankAccounts', () => {
    $scope.$parent.bankAccounts = $scope.bankAccounts;
  });
}
