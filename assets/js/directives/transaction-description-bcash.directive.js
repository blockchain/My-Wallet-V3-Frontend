angular
  .module('walletDirectives')
  .directive('transactionDescriptionBcash', transactionDescriptionBcash);

function transactionDescriptionBcash ($translate, Wallet, MyWallet, Ethereum, ShapeShift, currency) {
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

    scope.isBitCurrency = currency.isBitCurrency;
    scope.fromSatoshi = currency.convertFromSatoshi;
    scope.bchCurrency = currency.bchCurrencies[0];

    scope.toIndex = () => {
      let toIndex = scope.tx.to[0] && scope.tx.to[0].accountIndex;
      if (toIndex >= 0) return toIndex === 0 ? ' ' : toIndex + 1;
      else return false;
    };

    scope.fromIndex = () => {
      let fromIndex = scope.tx.from.accountIndex;
      if (fromIndex >= 0) return fromIndex === 0 ? ' ' : fromIndex + 1;
      else return false;
    };

    scope.settings = Wallet.settings;
  }
}
