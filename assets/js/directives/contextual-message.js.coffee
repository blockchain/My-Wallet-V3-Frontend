walletApp.directive('contextualMessage', ($cookies, Wallet, SecurityCenter) ->
  {
    restrict: "E"
    replace: true
    templateUrl: "templates/contextual-message.jade"
    link: (scope, elem, attrs) ->

      scope.presets = ['SECURE_WALLET_MSG_1', 'SECURE_WALLET_MSG_2']
      scope.msgCookie = $cookies.getObject('contextual-message')
      scope.reveal = false

      scope.nextWeek = () -> new Date(Date.now() + 604800000).getTime()
      # scope.nextWeek = () -> new Date(Date.now() + 10000).getTime()

      scope.showMessage = (index) ->
        scope.messageIndex = index
        scope.message = scope.presets[index]

      scope.dismissMessage = (nextIndex, time=scope.nextWeek()) ->
        scope.dismissed = true
        scope.reveal = false
        $cookies.putObject('contextual-message', {
          index: nextIndex
          when: time
        })

      scope.shouldShow = () ->
        balance = Wallet.total('accounts')
        security = SecurityCenter.security.score
        isTime = if scope.msgCookie? then Date.now() > scope.msgCookie.when else true

        balance > 0.2 && security < 0.5 && isTime

      scope.revealMsg = ()->
        scope.reveal = true

      unwatch = scope.$watch 'shouldShow()', (show) ->
        if show
          unwatch()
          idx = if scope.msgCookie? then scope.msgCookie.index else 0
          scope.showMessage(idx)

  }
)
