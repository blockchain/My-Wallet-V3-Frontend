@ClaimModalCtrl = ($scope, Wallet, $translate,$modalInstance, claim) ->        
  $scope.accounts = Wallet.accounts
  $scope.fields = {to:  Wallet.accounts[Wallet.getDefaultAccountIndex()]}
  
  $scope.balance = null
  
  $scope.redeem = () ->
    console.log "redeem..."
    success = () ->
      $modolInstance.dismiss ""
      
    Wallet.redeemFromEmailOrMobile($scope.fields.to, claim, success)
