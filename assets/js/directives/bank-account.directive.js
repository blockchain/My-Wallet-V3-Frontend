angular
  .module('walletApp')
  .directive('bankAccount', bankAccount);

bankAccount.$inject = ['MyWallet'];

function bankAccount (MyWallet) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      onLoad: '&',
      transaction: '='
    },
    templateUrl: 'templates/bank-account.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.$watch('bankAccount', (newVal) => {
      if (newVal) scope.onLoad();
    });

    scope.label = MyWallet.wallet.hdwallet.accounts[0].label;

    scope.formattedBankAccount = {
      'Bank Name': scope.transaction.bankAccount.bankName,
      'BIC': scope.transaction.bankAccount.bic,
      'Number': scope.transaction.bankAccount.number,
      'Type': scope.transaction.bankAccount.type
    };

    scope.bankAddress = {
      'City': scope.transaction.bankAccount.bankAddress._city,
      'Country': scope.transaction.bankAccount.bankAddress._country,
      'State': scope.transaction.bankAccount.bankAddress._state,
      'Street': scope.transaction.bankAccount.bankAddress._street,
      'Zipcode': scope.transaction.bankAccount.bankAddress._zipcode
    };
  }
}
