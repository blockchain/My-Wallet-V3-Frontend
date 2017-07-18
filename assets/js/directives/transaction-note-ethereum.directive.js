
angular
  .module('walletDirectives')
  .directive('transactionNoteEthereum', transactionNoteEthereum);

function transactionNoteEthereum ($translate, $rootScope, Wallet, Ethereum) {
  const directive = {
    restrict: 'E',
    replace: false,
    scope: {
      transaction: '=',
      account: '=',
      search: '='
    },
    templateUrl: 'templates/transaction-note-ethereum.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.state = {
      editNote: false,
      note: Ethereum.getTxNote(scope.transaction.hash)
    };

    scope.cancelEditNote = () => {
      scope.state.draftNote = '';
      scope.state.editNote = false;
    };

    scope.startEditNote = () => {
      if (scope.state.note) scope.state.draftNote = scope.state.note;
      scope.state.editNote = true;
    };

    scope.saveNote = () => {
      Ethereum.setTxNote(scope.transaction.hash, scope.state.draftNote);
      scope.state.note = scope.state.draftNote;
      scope.state.editNote = false;
    };

    scope.deleteNote = () => {
      scope.state.note = null;
      scope.state.editNote = false;
    };

    scope.$watch('state.note', (newVal, oldVal) => {
      if (scope.transaction != null) {
        scope.state.draftNote = '';
      }
      if (newVal != null && newVal !== oldVal && newVal !== '') {
        Ethereum.setTxNote(scope.transaction.hash, scope.state.note);
      }
    });
  }
}
