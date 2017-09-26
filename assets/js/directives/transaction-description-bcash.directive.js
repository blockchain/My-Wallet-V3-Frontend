angular
  .module('walletDirectives')
  .directive('transactionDescriptionBcash', transactionDescriptionBcash);

function transactionDescriptionBcash ($translate, Wallet, MyWallet, Ethereum, ShapeShift) {
  const directive = {
    restrict: 'E',
    replace: false,
    scope: {
      tx: '=transaction'
    },
    templateUrl: 'templates/transaction-description-bcash.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    let currentYear = new Date().getFullYear();
    let isCurrentYear = currentYear === new Date(scope.tx.time * 1000).getFullYear();
    scope.year = isCurrentYear ? '' : 'yyyy';

    scope.isDepositTx = ShapeShift.isDepositTx;
    scope.isWithdrawalTx = ShapeShift.isWithdrawalTx;

    scope.settings = Wallet.settings;
  }
}
