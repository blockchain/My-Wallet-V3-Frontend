angular
  .module('walletDirectives')
  .directive('transactionDescriptionEthereum', transactionDescriptionEthereum);

function transactionDescriptionEthereum ($translate, Wallet, MyWallet, Ethereum, ShapeShift) {
  const directive = {
    restrict: 'E',
    replace: false,
    scope: {
      tx: '=transaction',
      search: '=highlight'
    },
    templateUrl: 'templates/transaction-description-ethereum.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    let currentYear = new Date().getFullYear();
    let isCurrentYear = currentYear === new Date(scope.tx.time * 1000).getFullYear();
    scope.year = isCurrentYear ? '' : 'yyyy';

    let def = Ethereum.defaultAccount;
    let legacy = Ethereum.legacyAccount;

    scope.toAccount = scope.tx.isToAccount(def)
      ? def
      : legacy && scope.tx.isToAccount(legacy)
        ? legacy
        : false;

    scope.fromAccount = scope.tx.isFromAccount(def)
      ? def
      : legacy && scope.tx.isFromAccount(legacy)
        ? legacy
        : false;

    scope.note = Ethereum.getTxNote(scope.tx.hash);

    scope.isDepositTx = ShapeShift.isDepositTx;
    scope.isWithdrawalTx = ShapeShift.isWithdrawalTx;

    scope.setNote = (note) => {
      Ethereum.setTxNote(scope.tx.hash, note);
    };

    scope.txType = scope.tx.getTxType(Ethereum.eth.activeAccountsWithLegacy);

    scope.getTxDirection = (type) => {
      if (type === 'sent') return 'SENT';
      if (type === 'received') return 'RECEIVED_BITCOIN_FROM';
      if (type === 'transfer') return 'MOVED_BITCOIN_TO';
    };

    scope.getTxClass = (type) => {
      if (type === 'sent') return 'outgoing_tx';
      if (type === 'received') return 'incoming_tx';
      if (type === 'transfer') return 'local_tx';
    };

    scope.settings = Wallet.settings;

    scope.txDirection = scope.getTxDirection(scope.txType);
    scope.txClass = scope.getTxClass(scope.txType);

    scope.$watch('tx.confirmations', () => {
      if (scope.tx && scope.tx.confirmations != null) {
        scope.complete = scope.tx.confirmations >= 12;
      }
    });
  }
}
