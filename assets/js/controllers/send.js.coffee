@SendCtrl = ($scope, Wallet, $modalInstance) ->
  
  any = {address: null, title: "Any Account"}
  
  $scope.currencies = {isOpen: false}
  
  $scope.transaction = {from: any, to: undefined, amount: 0.0, currency: "BTC", privacyGuard: false, advanced: false}
  
  $scope.addresses = [any, {address: "abcdefgh", title: "Coming soon..."}]
  
  $scope.close = () ->
    $modalInstance.dismiss ""
  
  #################################
  #           Private             #
  #################################
  
  $scope.$watchCollection "[transaction.to, transaction.from.address]", () ->
    $scope.transactionIsValid = $scope.validate($scope.transaction)
    
  $scope.validate = (transaction) ->
    return false if transaction.to == null
    return false if transaction.to == undefined
    return false if transaction.to == ""
    
    return true