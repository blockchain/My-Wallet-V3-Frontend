walletApp.directive('watchForInactivity', (Wallet) ->
  {
    restrict: "AC"
    link: () ->
      document.onmousemove = () ->
        if Wallet.my.getGuid()
          Wallet.my.setLogoutTime(Wallet.my.getLogoutTime())
  }
)