walletApp.directive('watchForInactivity', (Wallet) ->
  {
    restrict: "AC"
    link: () ->
      document.onmousedown = () ->
        if Wallet.my.getGuid()
          Wallet.my.setLogoutTime(Wallet.my.getLogoutTime())
  }
)