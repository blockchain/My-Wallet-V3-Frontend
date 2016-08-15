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
      pendingTx: '=',
      transaction: '='
    },
    templateUrl: 'templates/bank-account.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.$watch('transaction.bankAccount', (newVal) => {
      if (scope.transaction.state === 'completed_test') scope.pendingTx(scope.transaction);
      if (newVal) scope.onLoad();
    });

    if (!scope.transaction) return;

    scope.label = MyWallet.wallet.hdwallet.accounts[0].label;
    scope.bankAccount = scope.transaction.bankAccount;

    scope.formattedBankAccount = {
      'IBAN': scope.bankAccount.number,
      'BIC': scope.bankAccount.bic,
      'Bank Name': scope.bankAccount.bankName,
      'Bank Address': scope.bankAccount.bankAddress.street + ', ' +
                      scope.bankAccount.bankAddress.city + ', ' +
                      scope.bankAccount.bankAddress.state + ', ' +
                      scope.bankAccount.bankAddress.country + ', ' +
                      scope.bankAccount.bankAddress.zipcode,
      'Message': scope.bankAccount.referenceText
    };

    scope.fakeBankTransfer = () => {
      const success = () => {
        scope.pendingTx(scope.transaction);
      };

      scope.transaction.fakeBankTransfer().then(success);
    };
  }
}
