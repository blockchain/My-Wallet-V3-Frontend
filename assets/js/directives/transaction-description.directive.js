angular
  .module('walletDirectives')
  .directive('transactionDescription', transactionDescription);

function transactionDescription ($translate, Wallet, MyWallet, coinify, unocoin, sfox, Labels, ShapeShift) {
  const directive = {
    restrict: 'E',
    replace: false,
    scope: {
      tx: '=transaction',
      search: '=highlight',
      account: '=account'
    },
    templateUrl: 'templates/transaction-description.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    let { external } = MyWallet.wallet;
    let currentYear = new Date().getFullYear();
    let isCurrentYear = currentYear === new Date(scope.tx.time * 1000).getFullYear();
    scope.year = isCurrentYear ? '' : 'yyyy';
    scope.note = scope.tx.note;

    scope.isDepositTx = ShapeShift.isDepositTx;
    scope.isWithdrawalTx = ShapeShift.isWithdrawalTx;

    if (scope.tx.txType === 'received') {
      if (scope.tx.to.length) {
        if (scope.tx.to[0].identity === 'imported') {
          if (scope.tx.to[0].label !== scope.tx.to[0].address) {
            scope.label = scope.tx.to[0].label;
          }
        } else {
          scope.label = Labels.getLabel(
            scope.tx.to[0].accountIndex,
            scope.tx.to[0].receiveIndex
          );
        }
      }
    }

    scope.deleteNote = () => {
      Wallet.deleteNote(scope.tx);
    };

    scope.setNote = (note) => {
      Wallet.setNote(scope.tx, note);
    };

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

    scope.getTxWatchOnly = (tx) => {
      return ((tx.txType === 'received' || tx.txType === 'transfer') && tx.toWatchOnly) ||
              (tx.txType === 'sent' && tx.fromWatchOnly);
    };

    scope.settings = Wallet.settings;

    scope.txDirection = scope.getTxDirection(scope.tx.txType);
    scope.txClass = scope.getTxClass(scope.tx.txType);
    scope.txWatchOnly = scope.getTxWatchOnly(scope.tx);

    if (external) {
      if (external.coinify.user) {
        scope.exchange = 'Coinify';
        coinify.init(external.coinify).then(() => scope.txMethod = coinify.getTxMethod(scope.tx.hash));
      }

      if (external.unocoin.user) {
        scope.exchange = 'Unocoin';
        unocoin.init(external.unocoin).then(() => scope.txMethod = unocoin.getTxMethod(external.unocoin, scope.tx.hash));
      }

      if (external.sfox.user) {
        scope.exchange = 'SFOX';
        sfox.init(external.sfox).then(() => scope.txMethod = sfox.getTxMethod(scope.tx.hash));
      }
    }

    scope.$watch('tx.confirmations', () => {
      if (scope.tx && scope.tx.confirmations != null) {
        scope.minutesRemaining = 30 - scope.tx.confirmations * 10;
        scope.complete = scope.tx.confirmations >= 3;
        scope.frugalWarning = scope.tx.frugal && scope.tx.confirmations === 0;
      }
    });
  }
}
