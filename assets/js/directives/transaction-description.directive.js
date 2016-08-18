
angular
  .module('walletApp')
  .directive('transactionDescription', transactionDescription);

function transactionDescription ($translate, Wallet, buySell) {
  const directive = {
    restrict: 'E',
    replace: false,
    scope: {
      tx: '=transaction',
      search: '=highlight',
      account: '=account'
    },
    templateUrl: 'templates/transaction-description.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.exchange = 'Coinify';

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

    scope.getTxMethod = (tx) => {
      let addrs = tx.processedOutputs.map(i => i.address);
      return addrs.reduce((acc, a) => acc || buySell.getAddressMethod(a), null);
    };

    scope.settings = Wallet.settings;

    scope.txDirection = scope.getTxDirection(scope.tx.txType);
    scope.txClass = scope.getTxClass(scope.tx.txType);
    scope.txWatchOnly = scope.getTxWatchOnly(scope.tx);
    buySell.initialized().finally(() => scope.txMethod = scope.getTxMethod(scope.tx));

    scope.$watch('tx.confirmations', () => {
      if (scope.tx && scope.tx.confirmations != null) {
        scope.minutesRemaining = 30 - scope.tx.confirmations * 10;
        scope.complete = scope.tx.confirmations >= 3;
        scope.frugalWarning = scope.tx.frugal && scope.tx.confirmations === 0;
      }
    });
  }
}
