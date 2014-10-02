@SendCtrl = ($scope, $log, Wallet, $modalInstance, ngAudio) ->
  
  $scope.alerts = []
  
  any = {address: null, title: "Any Account"}
  
  $scope.currencies = {isOpen: false}
  
  $scope.transaction = {from: any, to: "", amount: 0.0, currency: "BTC", privacyGuard: false, advanced: false}
  
  $scope.addresses = [any, {address: "abcdefgh", title: "Coming soon..."}]
  
  $scope.close = () ->
    $modalInstance.dismiss ""
  
  $scope.send = () ->
    for alert in $scope.alerts
      $scope.alerts.pop(alert)

    Wallet.send($scope.transaction.to, $scope.transaction.amount, $scope.observer)
  
  $scope.closeAlert = (index) ->
    $scope.alerts.splice index, 1
    return
    
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
  $scope.observer.transactionDidFailWithError = (message) ->
    $scope.alerts.push {type: "danger", msg: message}
  $scope.observer.transactionDidFinish = () ->
    sound = ngAudio.load("beep.wav")
    sound.play()
    $modalInstance.close ""
  
