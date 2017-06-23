angular
  .module('walletDirectives')
  .directive('transactionDescription', transactionDescription);

function transactionDescription ($translate, $injector, Wallet, MyWallet, buySell, unocoin) {
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
      if (external.coinify) scope.exchange = 'Coinify';
      if (external.coinify) buySell.initialized().finally(() => scope.txMethod = buySell.getTxMethod(scope.tx.hash));

      if (external.unocoin) scope.exchange = 'Unocoin';
      if (external.unocoin) $injector.get('unocoin').init(external.unocoin).then(() => scope.txMethod = unocoin.getTxMethod(external.unocoin, scope.tx.hash));
    }

    buySell.initialized();

    scope.$watch('tx.confirmations', () => {
      if (scope.tx && scope.tx.confirmations != null) {
        scope.minutesRemaining = 30 - scope.tx.confirmations * 10;
        scope.complete = scope.tx.confirmations >= 3;
        scope.frugalWarning = scope.tx.frugal && scope.tx.confirmations === 0;
      }
    });
  }
}
