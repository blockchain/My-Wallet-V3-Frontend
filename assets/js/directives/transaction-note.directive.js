
angular
  .module('walletApp')
  .directive('transactionNote', transactionNote);

function transactionNote ($translate, $rootScope, Wallet) {
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

    let match = (a, b, prop) => {
      let seen = {};
      for (let i = 0, len = a.length; i < len; i++) seen[prop ? a[i][prop] : a[i]] = true;
      for (let i = 0, len = b.length; i < len; i++) if (seen[prop ? b[i][prop] : b[i]]) return b[i];
      return false;
    };

    if (scope.transaction.txType === 'received') {
      let account = parseInt(scope.account, 10);
      let addresses = scope.transaction.processedOutputs.filter(p => p.identity >= 0);

      if (addresses.length) {
        if (isNaN(account)) account = addresses[0].identity;
        let hdAddresses = Wallet.getLabelledHdAddresses(account);
        scope.label = match(addresses, hdAddresses, 'address').label;
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
