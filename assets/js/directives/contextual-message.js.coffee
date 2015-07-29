walletApp.directive('contextualMessage', ($cookies, Wallet, SecurityCenter) ->
  {
    restrict: "E"
    replace: true
    templateUrl: "templates/contextual-message.jade"
    link: (scope, elem, attrs) ->

      scope.presets = ['MSG_1', 'MSG_2']
      scope.msgCookie = $cookies.getObject('contextual-message')

      # scope.nextWeek = () -> new Date(Date.now() + 604800000).getTime()
      scope.nextWeek = () -> new Date(Date.now() + 10000).getTime()

      scope.showMessage = (index) ->
        scope.messageIndex = index
        scope.message = scope.presets[index]

      scope.dismissMessage = (nextIndex, time=scope.nextWeek()) ->
        scope.dismissed = true
        $cookies.putObject('contextual-message', {
          index: nextIndex
          when: time
        })

      scope.shouldShow = () ->
        balance = Wallet.total('accounts')
        security = SecurityCenter.security.score
        isTime = if scope.msgCookie? then Date.now() > scope.msgCookie.when else true

        # Log time until message can be shown, remove before PR
        if scope.msgCookie?
          console.log scope.msgCookie.when - Date.now()

        balance > 0.0 && security < 0.5 && isTime

      scope.putMsgInConsole = ()->
        console.log("justin, should we start drinking now?")

      unwatch = scope.$watch 'shouldShow()', (show) ->
        if show
          unwatch()
          idx = if scope.msgCookie? then scope.msgCookie.index else 0
          scope.showMessage(idx)

  }
)
