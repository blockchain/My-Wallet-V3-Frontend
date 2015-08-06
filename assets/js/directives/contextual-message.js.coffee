walletApp.directive('contextualMessage', ($cookies, $window, Wallet, SecurityCenter, filterFilter) ->
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
        balance = Wallet.convertFromSatoshi(Wallet.total('accounts'), Wallet.settings.btcCurrency)
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

      #dynamically position beacon
      n = elem.parent()[0]
      h = n.offsetHeight
      s = n.children[5]
      o = -> s.offsetTop
      w = -> $window.location.hash
      if filterFilter(Wallet.legacyAddresses(), {archived: false}).length > 0 then elem.css('top', 135) else elem.css('top', 95)

      a = (newVal) ->
        elem.css('top', o) if newVal.indexOf('transactions') != -1

      scope.$watch w, a

  }
)
