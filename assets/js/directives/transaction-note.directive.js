
angular
  .module('walletDirectives')
  .directive('transactionNote', transactionNote);

function transactionNote ($translate, $rootScope, Wallet) {
  const directive = {
    restrict: 'E',
    replace: false,
    scope: {
      setNote: '&',
      deleteNote: '&',
      transaction: '=',
      account: '=',
      search: '=',
      label: '=',
      note: '='
    },
    templateUrl: 'templates/transaction-note.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.editNote = false;

    scope.cancelEditNote = () => {
      scope.draftNote = '';
      scope.editNote = false;
    };

    scope.startEditNote = () => {
      if (scope.note) scope.draftNote = scope.note;
      scope.editNote = true;
    };

    scope.saveNote = () => {
      scope.note = scope.draftNote;
      scope.editNote = false;
      scope.setNote({note: scope.note});
    };

    scope.removeNote = () => {
      scope.note = null;
      scope.editNote = false;
      scope.deleteNote();
    };
  }
}
