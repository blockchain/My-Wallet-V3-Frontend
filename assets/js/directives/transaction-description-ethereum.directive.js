angular
  .module('walletDirectives')
  .directive('transactionDescriptionEthereum', transactionDescriptionEthereum);

function transactionDescriptionEthereum ($translate, Wallet, MyWallet, Ethereum) {
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
    scope.addr = Ethereum.defaultAccount.address;
    scope.note = Ethereum.getTxNote(scope.tx.hash);

    scope.setNote = (note) => {
      Ethereum.setTxNote(scope.tx.hash, note);
    };

    scope.getTxDirection = (address, tx) => {
      let { from, to } = tx;
      if (address === from) {
        scope.tx.txType = 'sent';
        return 'SENT';
      }
      if (address === to) {
        scope.tx.txType = 'received';
        return 'RECEIVED_BITCOIN_FROM';
      }
    };

    scope.getTxClass = (txType) => {
      if (txType === 'sent') return 'outgoing_tx';
      if (txType === 'received') return 'incoming_tx';
    };

    scope.settings = Wallet.settings;

    scope.txDirection = scope.getTxDirection(scope.addr, scope.tx);
    scope.txClass = scope.getTxClass(scope.tx.txType);

    scope.$watch('tx.confirmations', () => {
      if (scope.tx && scope.tx.confirmations != null) {
        scope.minutesRemaining = 30 - scope.tx.confirmations * 10;
        scope.complete = scope.tx.confirmations >= 3;
        scope.frugalWarning = scope.tx.frugal && scope.tx.confirmations === 0;
      }
    });
  }
}
