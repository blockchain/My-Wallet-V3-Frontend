@SendCtrl = ($scope, $log, Wallet, $modalInstance) ->
  
  any = {address: null, title: "Any Account"}
  
  $scope.currencies = {isOpen: false}
  
  $scope.transaction = {from: any, to: "", amount: 0.0, currency: "BTC", privacyGuard: false, advanced: false}
  
  $scope.addresses = [any, {address: "abcdefgh", title: "Coming soon..."}]
  
  $scope.close = () ->
    $modalInstance.dismiss ""
  
  $scope.send = () ->
    Wallet.send($scope.transaction.to, $scope.transaction.amount, $scope.observer)
  
  #################################
  #           Private             #
  #################################
  
  $scope.$watchCollection "[transaction.to, transaction.from.address]", () ->
    $scope.transactionIsValid = $scope.validate($scope.transaction)
    
  $scope.validate = (transaction) ->
    return false if transaction.to == null
    return false if transaction.to == undefined
    return false if transaction.to == ""
    return false if transaction.currency != 'BTC'
    
    return true
  
  $scope.observer = {}
  $scope.observer.transactionDidFailWithError = () ->
      $log.error "Mission failed"