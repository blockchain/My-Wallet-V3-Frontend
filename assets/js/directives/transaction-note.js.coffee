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
        
      scope.$watch "transaction.note", (newVal, oldVal) ->
        if scope.transaction?
          scope.transaction.draftNote = ""
        
        if (!newVal? || newVal == "") && oldVal? && oldVal != ""
          Wallet.deleteNote(scope.transaction)
          
        if newVal?
          if newVal != oldVal && newVal != ""
            Wallet.setNote(scope.transaction, scope.transaction.note)
  } 
)