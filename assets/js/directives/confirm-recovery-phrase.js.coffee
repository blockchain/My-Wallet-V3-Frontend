walletApp.directive('confirmRecoveryPhrase', ($translate, Wallet, $modal) ->
  {
    restrict: "E"
    replace: 'true'
    scope: {
    }
    templateUrl: 'templates/confirm-recovery-phrase.jade'
    link: (scope, elem, attrs) ->

      scope.status = Wallet.status
              
      scope.confirmRecoveryPhrase = () ->
        modalInstance = $modal.open(
          templateUrl: "partials/confirm-recovery-phrase-modal.jade"
          controller: ConfirmRecoveryPhraseCtrl
          windowClass: "bc-modal"
        ).opened.then () ->
          Wallet.store.resetLogoutTimeout()

        return
  }
)






