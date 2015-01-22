@SettingsAccountsCtrl = ($scope, Wallet, $modal) ->
  $scope.accounts = Wallet.accounts
  
  $scope.newAccount = () ->
    Wallet.clearAlerts()
    modalInstance = $modal.open(
      templateUrl: "partials/account-form.jade"
      controller: AccountFormCtrl
      resolve:
        account: -> undefined
      windowClass: "blockchain-modal"
    )
    
  $scope.editAccount = (account) ->
    Wallet.clearAlerts()
    modalInstance = $modal.open(
      templateUrl: "partials/account-form.jade"
      controller: AccountFormCtrl
      resolve:
        account: -> account
      windowClass: "blockchain-modal"
    )
  
  $scope.showAddress = (account) ->
            
    modalInstance = $modal.open(
      templateUrl: "partials/request.jade"
      controller: RequestCtrl
      resolve:
        destination: -> account
      windowClass: "blockchain-modal"
    )
  
    
  $scope.makeDefault = (account) ->
    Wallet.setDefaultAccount(account)
    

  $scope.transfer = (address) ->
    $modal.open(
      templateUrl: "partials/send.jade"
      controller: SendCtrl
      resolve:
        paymentRequest: -> 
          {fromAddress: address, amount: 0, toAccount: Wallet.accounts[Wallet.getDefaultAccountIndex()]}
    )
