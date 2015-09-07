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
      
    error = () ->
      $scope.redeeming = false
      
    $scope.redeeming = true

    Wallet.redeemFromEmailOrMobile($scope.fields.to, claim.code).publish(null,null)
      .then(success)
      .catch(error)