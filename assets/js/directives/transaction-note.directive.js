
angular
  .module('walletDirectives')
  .directive('transactionNote', transactionNote);

function transactionNote ($translate, $rootScope, Wallet, Labels) {
  const directive = {
    restrict: 'E',
    replace: false,
    scope: {
      transaction: '=',
      account: '=',
      search: '='
    },
    templateUrl: 'templates/transaction-note.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.editNote = false;
    if (scope.transaction.txType === 'received') {
      if (scope.transaction.to.length) {
        if (scope.transaction.to[0].identity === 'imported') {
          if (scope.transaction.to[0].label !== scope.transaction.to[0].address) {
            scope.label = scope.transaction.to[0].label;
          }
        } else {
          scope.label = Labels.getLabel(
            scope.transaction.to[0].accountIndex,
            scope.transaction.to[0].receiveIndex
          );
        }
      }
    }

    scope.cancelEditNote = () => {
      scope.transaction.draftNote = '';
      scope.editNote = false;
    };

    scope.startEditNote = () => {
      if (scope.transaction.note) scope.transaction.draftNote = scope.transaction.note;
      scope.editNote = true;
    };

    scope.saveNote = () => {
      scope.transaction.note = scope.transaction.draftNote;
      scope.editNote = false;
    };

    scope.deleteNote = () => {
      scope.transaction.note = null;
      scope.editNote = false;
    };

    scope.$watch('transaction.note', (newVal, oldVal) => {
      if (scope.transaction != null) {
        scope.transaction.draftNote = '';
      }
      if ((newVal == null || newVal === '') && (oldVal != null) && oldVal !== '') {
        Wallet.deleteNote(scope.transaction);
      }
      if (newVal != null && newVal !== oldVal && newVal !== '') {
        Wallet.setNote(scope.transaction, scope.transaction.note);
      }
    });
  }
}
