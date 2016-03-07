
angular
  .module('walletApp')
  .directive('transactionDescription', transactionDescription);

function transactionDescription($translate, $rootScope, Wallet, $compile, $sce) {
  const directive = {
    restrict: 'E',
    replace: false,
    scope: {
      tx: '=transaction',
      search: '=highlight'
    },
    templateUrl: 'templates/transaction-description.jade',
    link: link
  };
  return directive;

  function link(scope, elem, attrs) {
    scope.getAction = (txType) => {
      if (txType === 'sent')      return 'SENT';
      if (txType === 'received')  return 'RECEIVED_BITCOIN_FROM';
      if (txType === 'transfer')  return 'MOVED_BITCOIN_TO';
    };

    scope.getLabels = (tx) => {
      if (!tx || !tx.processedInputs || !tx.processedOutputs) return;

      let formatted = Wallet.formatTransactionCoins(tx);
      let outputsLabel = '';

      if (formatted.outputs && formatted.outputs.length > 0) {
        outputsLabel = formatted.outputs[0].label;
      }
      if (formatted.outputs.length > 1) {
        outputsLabel = $translate.instant('RECIPIENTS', { n: formatted.outputs.length });
      }

      return tx.txType === 'sent' ? ({
        primary: scope.primaryLabel = outputsLabel,
        secondary: scope.secondaryLabel = formatted.input.label
      }) : ({
        primary: scope.primaryLabel = formatted.input.label,
        secondary: scope.secondaryLabel = outputsLabel
      });
    };

    scope.$watch('search', (search) => {
      if (search == null) return;
      let s = search.toLowerCase();
      let searchInAddress = scope.primaryLabel.toLowerCase().search(s) > -1;
      let searchInOther = scope.secondaryLabel.toLowerCase().search(s) > -1;
      scope.tx.toggled = !searchInAddress && searchInOther;
    });
  }
}
