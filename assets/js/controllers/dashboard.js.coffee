@DashboardCtrl = ($scope, $log, Wallet, $cookieStore) ->
  $scope.status = Wallet.status    
  $scope.uid = $cookieStore.get("uid")
  
  if $scope.savePassword && !$scope.status.isLoggedIn && !!$cookieStore.get("password")
    Wallet.login($cookieStore.get("uid"), $cookieStore.get("password"))
  
  $scope.login = () ->
    Wallet.clearAlerts()
    Wallet.login($scope.uid, $scope.password)
    $cookieStore.put("uid", $scope.uid)
    if $scope.savePassword
       $cookieStore.put("password", $scope.password)
    
  $scope.create = () ->
    Wallet.clearAlerts()
    if Wallet.create($scope.uid, $scope.password)
      $cookieStore.put("uid", $scope.uid)
      if $scope.savePassword
        $cookieStore.put("password", $scope.password)
