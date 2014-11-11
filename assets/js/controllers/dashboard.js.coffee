@DashboardCtrl = ($scope, $log, Wallet, $cookieStore, $modal) ->
  $scope.status = Wallet.status    
  $scope.uid = $cookieStore.get("uid")
  
  $scope.login = () ->
    Wallet.clearAlerts()
    Wallet.login($scope.uid, $scope.password)
    $cookieStore.put("uid", $scope.uid)
    if $scope.savePassword
       $cookieStore.put("password", $scope.password)
    
  $scope.create = () ->
    Wallet.clearAlerts()

    modalInstance = $modal.open(
      templateUrl: "partials/signup"
      controller: SignupCtrl
    )
