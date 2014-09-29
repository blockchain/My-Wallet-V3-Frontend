@DashboardCtrl = ($scope, $log, Wallet, $cookies) ->
  $scope.status = Wallet.status    
  $scope.uid = $cookies.uid

  if !$scope.status.isLoggedIn && !!$cookies.password
    # TODO: don't use the password to restore a session
    Wallet.login($cookies.uid, $cookies.password)
  
  $scope.login = () ->
    Wallet.login($scope.uid, $scope.password)
    $cookies.uid = $scope.uid
    # Temporary solution: we should not store the password
    $cookies.password = $scope.password