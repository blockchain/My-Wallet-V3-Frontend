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

    scope.getTxDirection = (txType) => {
      if (txType === 'sent') return 'SENT';
      if (txType === 'received') return 'RECEIVED_BITCOIN_FROM';
      if (txType === 'transfer') return 'MOVED_BITCOIN_TO';
    };

    scope.getTxClass = (txType) => {
      if (txType === 'sent') return 'outgoing_tx';
      if (txType === 'received') return 'incoming_tx';
      if (txType === 'transfer') return 'local_tx';
    };

    scope.txDirection = scope.getTxDirection(scope.tx.txType);
    scope.txClass = scope.getTxClass(scope.tx.txType);

    scope.isDepositTx = ShapeShift.isDepositTx;
    scope.isWithdrawalTx = ShapeShift.isWithdrawalTx;

    scope.settings = Wallet.settings;
  }
}
