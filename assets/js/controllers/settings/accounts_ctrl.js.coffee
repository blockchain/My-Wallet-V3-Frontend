@SettingsAccountsCtrl = ($scope, Wallet, $modal) ->
  $scope.accounts = Wallet.accounts
  
  $scope.display = {archived: false}  
  
  
  $scope.newAccount = () ->
    Wallet.clearAlerts()
    modalInstance = $modal.open(
      templateUrl: "partials/account-form.jade"
      controller: AccountFormCtrl
      resolve:
        account: -> undefined
      windowClass: "bc-modal"
    )
    if modalInstance?
      modalInstance.opened.then () ->
        Wallet.store.resetLogoutTimeout()
    
  $scope.editAccount = (account) ->
    Wallet.clearAlerts()
    modalInstance = $modal.open(
      templateUrl: "partials/account-form.jade"
      controller: AccountFormCtrl
      resolve:
        account: -> account
      windowClass: "bc-modal"
    )
    if modalInstance?
      modalInstance.opened.then () ->
        Wallet.store.resetLogoutTimeout()
  
  $scope.showAddress = (account) ->
            
    modalInstance = $modal.open(
      templateUrl: "partials/request.jade"
      controller: RequestCtrl
      resolve:
        destination: -> account
      windowClass: "bc-modal"
    )
    if modalInstance?
      modalInstance.opened.then () ->
        Wallet.store.resetLogoutTimeout()
  
    
  $scope.makeDefault = (account) ->
    Wallet.setDefaultAccount(account)
    

  $scope.transfer = (address) ->
    modalInstance = $modal.open(
      templateUrl: "partials/send.jade"
      controller: SendCtrl
      resolve:
        paymentRequest: -> 
          {fromAddress: address, amount: 0, toAccount: Wallet.accounts[Wallet.getDefaultAccountIndex()]}
      windowClass: "bc-modal"
    )
    if modalInstance?
      modalInstance.opened.then () ->
        Wallet.store.resetLogoutTimeout()

  $scope.archive = (account) ->
    Wallet.archive(account)
    
  $scope.unarchive = (account) ->
    Wallet.unarchive(account)
