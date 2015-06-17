walletApp.controller "NavigationCtrl", ($scope, Wallet, SecurityCenter, $translate, $cookieStore, $state, filterFilter, $interval) ->
  
  $scope.status = Wallet.status
  $scope.security = SecurityCenter.security
  $scope.settings = Wallet.settings
  
  $scope.visitTransactions = () ->
    if $scope.numberOfActiveAccounts() > 1
      $state.go("wallet.common.transactions", {accountIndex:'accounts'})
    else
      $state.go("wallet.common.transactions", {accountIndex:Wallet.getDefaultAccountIndex()})

  $scope.numberOfActiveAccounts = () -> 
    return filterFilter(Wallet.accounts, {active: true}).length
  
  $scope.isTransactionState = () ->
    return $state.current.name == "wallet.common.transactions" || $state.current.name == "wallet.common.transaction"

  $scope.isSecurityState = () ->
    return $state.current.name == "wallet.common.settings.security-center" 
  
  $scope.logout = () ->  
    if !Wallet.isSynchronizedWithServer() 
      if confirm "There are changes still being saved. Are you sure you wish to logout?"
        $scope.doLogout()
    else
      $scope.doLogout()
  
  $scope.openZeroBlock = () ->
    win = window.open('https://zeroblock.com', "_blank")
    win.focus()

  $scope.openBCmarkets = () ->
    win = window.open('https://markets.blockchain.info/', "_blank")
    win.focus()

  #################################
  #           Private             #
  #################################
  

  $scope.doLogout = () ->   
    $translate("ARE_YOU_SURE_LOGOUT").then (translation) ->      
      if confirm translation
        $scope.uid = null
        $scope.password = null
        $cookieStore.remove("password")
        # $cookieStore.remove("uid") // Pending a "Forget Me feature"
        $state.go("wallet.common.transactions", {accountIndex: "accounts"})
        Wallet.logout() # Refreshes the browser, so won't return
        return  

  intervalTime = 15 * 60 * 1000
  $interval (->
    if Wallet.status.isLoggedIn
      Wallet.fetchExchangeRate()
  ), intervalTime