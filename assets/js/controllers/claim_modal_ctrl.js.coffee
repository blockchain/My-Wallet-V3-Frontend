walletApp.controller "ClaimModalCtrl", ($scope, Wallet, $translate, $modalInstance, claim) ->        
  $scope.accounts = Wallet.accounts
  $scope.fields = {to:  null}
  
  $scope.$watchCollection "accounts()", ->
    $scope.fields.to = Wallet.accounts()[Wallet.getDefaultAccountIndex()]
  
  $scope.balance = null
  
  $scope.redeeming = false
    
  claim.balance.then (balance) ->
    $scope.balance = balance
  
  $scope.redeem = () ->
    success = () ->
      $scope.redeeming = false
      $modalInstance.dismiss ""
      Wallet.beep()
      $scope.$digest()
      
    error = (err) ->
      console.log(err)
      $scope.redeeming = false
      $scope.$digest()
      
    $scope.redeeming = true

    fee = Wallet.settings.feePerKB

    Wallet.redeemFromEmailOrMobile($scope.fields.to, claim.code, $scope.balance - fee, fee).publish(null,null)
      .then(success)
      .catch(error)