angular
  .module('walletApp')
  .directive('bankAccount', bankAccount);

bankAccount.$inject = ['MyWallet', '$rootScope'];

function bankAccount (MyWallet, $rootScope) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      formatTrade: '=',
      transaction: '='
    },
    templateUrl: 'templates/bank-account.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.$watch('transaction.bankAccount', (newVal) => {
      if (scope.transaction.state === 'completed_test') scope.formatTrade({id: scope.transaction.iSignThisID}, 'success');
    });

    if (!scope.transaction) return;

    scope.buySellDebug = $rootScope.buySellDebug;

    let accountIndex = scope.transaction.accountIndex;
    scope.label = MyWallet.wallet.hdwallet.accounts[accountIndex].label;

    scope.bankAccount = scope.transaction.bankAccount;
    scope.holderAddress = scope.transaction.holderAddress;

    scope.formattedBankAccount = {
      'Recipient Name': scope.bankAccount.holderName,
      'Recipient Address': [
        scope.bankAccount.holderAddress.street,
        scope.bankAccount.holderAddress.zipcode + ' ' + scope.bankAccount.holderAddress.city,
        scope.bankAccount.holderAddress.country
      ].join(', '),
      'IBAN': scope.bankAccount.number,
      'BIC': scope.bankAccount.bic,
      'Bank': [
        scope.bankAccount.bankName,
        scope.bankAccount.bankAddress.street,
        scope.bankAccount.bankAddress.zipcode + ' ' + scope.bankAccount.bankAddress.city,
        scope.bankAccount.bankAddress.country
      ].join(', '),
      'Message': scope.bankAccount.referenceText
    };

    scope.fakeBankTransfer = () => {
      scope.transaction.fakeBankTransfer().then(scope.formatTrade({id: scope.transaction.iSignThisID}, 'processing'));
    };

    scope.expireQuote = () => {
      scope.transaction.expireQuote();
    };
  }
}
