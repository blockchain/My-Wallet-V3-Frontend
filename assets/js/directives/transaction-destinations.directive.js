
angular
  .module('walletApp')
  .directive('transactionDestinations', transactionDestinations);

function transactionDestinations ($rootScope, Wallet, $translate) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      transaction: '=',
      search: '='
    },
    templateUrl: 'templates/transaction-destinations.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.getTxLabels = (tx) => {
      if (!tx || !tx.processedInputs || !tx.processedOutputs) return;

      let formatted = Wallet.formatTransactionCoins(tx);
      let outputsLabelPreview = '';
      let outputsLabel = '';

      if (formatted.outputs && formatted.outputs.length > 0) {
        outputsLabel = formatted.outputs.filter((o) => {
          return tx.txType === 'sent'
            ? o.coinType === 'external'
            : o.coinType !== 'external';
        });
      }

      if (outputsLabel.length > 1) {
        outputsLabelPreview = $translate.instant('RECIPIENTS', { n: formatted.outputs.length });
      }

      return tx.txType === 'sent' ? ({
        preview: outputsLabelPreview,
        primary: scope.primaryLabel = outputsLabel,
        secondary: scope.secondaryLabel = [formatted.input]
      }) : ({
        preview: outputsLabelPreview,
        primary: scope.primaryLabel = [formatted.input],
        secondary: scope.secondaryLabel = outputsLabel
      });
    };

    scope.txLabels = scope.getTxLabels(scope.transaction);
  }
}
