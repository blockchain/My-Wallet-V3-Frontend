angular
  .module('walletApp')
  .controller('CoinifyBankLinkController', CoinifyBankLinkController);

function CoinifyBankLinkController ($scope, Alerts, buySell, $q) {
  $scope.bankAccounts = $scope.$parent.bankAccounts;

  $scope.selecting = true;

  $scope.$parent.$parent.selectedBankAccount = $scope.selectedBankAccount;

  $scope.bankLinkEdit = () => $scope.selecting = !$scope.selecting;

  $scope.bankNumView = (number) => {
    return number.slice(number.length - 4);
  }

  $scope.addBankAccount = () => {
    $scope.$parent.goTo('account-info')
  };

  $scope.deleteAccount = (account) => {
    Alerts.confirm('CONFIRM_DELETE_BANK')
      .then(() => {
        $q.resolve(buySell.deleteBankAccount(account.id))
          .then((res) => {
            console.log('successful delete?', res)
          })
          .finally(() => {
            let accounts = $scope.$parent.bankAccounts
            console.log('first accounts', accounts)
            for (let i = 0; i < accounts.length; i++) {
              if (accounts[i]['id'] === account['id']) accounts.splice(i, 1);
            }
            console.log('accounts', accounts)
            $scope.selecting = false;
            $scope.$parent.bankAccounts = accounts;
            $scope.$parent.getBankAccounts();
          });
      })
    console.log('delete account with', account)
  };

  $scope.$watch('selectedBankAccount', () => {
    $scope.$parent.$parent.selectedBankAccount = $scope.selectedBankAccount;
  })

}
