@LoginCtrl = ($scope, $log, Wallet, $cookieStore, $modal, $state, $timeout) ->
  $scope.status = Wallet.status    
  $scope.settings = Wallet.settings
  
  if Wallet.guid?
    $scope.uid = Wallet.guid
  else
    $scope.uid = $cookieStore.get("uid")
  
  
  $scope.twoFactorCode = ""
  $scope.busy = false  
  $scope.isValid = false
  
  if !!$cookieStore.get("password")      
    $scope.password = $cookieStore.get("password")
  
  $scope.login = () ->
    # Is called twice for some reason... Related to ladda?
    return if $scope.busy
    
    $scope.busy = true
    Wallet.clearAlerts()
    
    error = () ->
      $scope.busy = false
    
    needs2FA = () ->
      $scope.busy = false
      
    success = () ->
      $scope.busy = false
            
    if !$scope.settings.needs2FA
      Wallet.login($scope.uid, $scope.password, null, needs2FA, success, error)
    else if $scope.twoFactorCode != ""
      Wallet.login($scope.uid, $scope.password, $scope.twoFactorCode, needs2FA, success, error)
      
    if $scope.uid? && $scope.uid != ""
      $cookieStore.put("uid", $scope.uid)

    if $scope.savePassword && $scope.password? && $scope.password != ""
       $cookieStore.put("password", $scope.password)

  $scope.$watch "status.isLoggedIn", (newValue) ->
    if newValue
      $scope.busy = false
      
      # $state.go("wallet.common.dashboard")
      $state.go("wallet.common.transactions", {accountIndex: "accounts"})
      
  $scope.$watch "uid + password", () ->
    isValid = null
    
    if !$scope.uid? || $scope.uid == ""
      isValid = false
      
    if !$scope.password? || $scope.password == ""
      isValid = false

    if !isValid?
      isValid = true
      
    $scope.isValid = isValid      