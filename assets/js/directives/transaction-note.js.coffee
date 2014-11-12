walletApp.directive('transactionNote', ($translate, $rootScope, Wallet) ->
  {
    restrict: "E"
    replace: 'false'
    scope: {
      transaction: '='
    }
    templateUrl: 'templates/transaction-note.html'
    link: (scope, elem, attrs) ->
      scope.editNote = false
      scope.transaction.draftNote = ""
      scope.cancelEditNote = () ->
        scope.transaction.draftNote = ""
        scope.editNote = false
      scope.startEditNote = () ->
        if scope.transaction.note
          scope.transaction.draftNote = scope.transaction.note
        scope.editNote = true
      scope.saveNote = () ->
        scope.transaction.note = scope.transaction.draftNote
        scope.editNote = false
      scope.deleteNote = () ->
        scope.transaction.note = null
        scope.editNote = false
  }
)