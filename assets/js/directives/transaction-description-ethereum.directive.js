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
    scope.acct = Ethereum.defaultAccount.label;
    scope.addr = Ethereum.defaultAccount.address;
    scope.note = Ethereum.getTxNote(scope.tx.hash);
    scope.isToAccount = scope.tx.isToAccount(Ethereum.defaultAccount);
    scope.isFromAccount = scope.tx.isFromAccount(Ethereum.defaultAccount);

    scope.isDepositTx = ShapeShift.isDepositTx;
    scope.isWithdrawalTx = ShapeShift.isWithdrawalTx;

    scope.setNote = (note) => {
      Ethereum.setTxNote(scope.tx.hash, note);
    };

    scope.txType = scope.tx.getTxType(Ethereum.defaultAccount);

    scope.getTxDirection = (type) => {
      if (type === 'sent') return 'SENT';
      if (type === 'received') return 'RECEIVED_BITCOIN_FROM';
    };

    scope.getTxClass = (txType) => {
      if (scope.txType === 'sent') return 'outgoing_tx';
      if (scope.txType === 'received') return 'incoming_tx';
    };

    scope.settings = Wallet.settings;

    scope.txDirection = scope.getTxDirection(scope.txType);
    scope.txClass = scope.getTxClass(scope.txType);
  }
}
