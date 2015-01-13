@LoginCtrl = ($scope, $log, Wallet, $cookieStore, $modal, $state, $timeout) ->
  $scope.status = Wallet.status    
  $scope.settings = Wallet.settings
  $scope.uid = $cookieStore.get("uid")
  $scope.twoFactorCode = ""
  $scope.creatingAccount = false
  $scope.busy = false  
  $scope.isValid = false
  
  if !!$cookieStore.get("password")      
    $scope.password = $cookieStore.get("password")
  
  $scope.login = () ->
    # Is called twice for some reason... Related to ladda?
    return if $scope.busy
    
    $scope.busy = true
    Wallet.clearAlerts()
    
    observer = {
      error: () ->
        $scope.busy = false
      
      needs2FA: () ->
        $scope.busy = false
    }      
            
    if !$scope.settings.needs2FA
      Wallet.login($scope.uid, $scope.password, null, observer)
    else if $scope.twoFactorCode != ""
      Wallet.login($scope.uid, $scope.password, $scope.twoFactorCode, observer)
      
    if $scope.uid? && $scope.uid != ""
      $cookieStore.put("uid", $scope.uid)

    if $scope.savePassword && $scope.password? && $scope.password != ""
       $cookieStore.put("password", $scope.password)
    
  $scope.create = () ->
    Wallet.clearAlerts()
    
    $scope.creatingAccount = true

    modalInstance = $modal.open(
      templateUrl: "partials/signup.jade"
      controller: SignupCtrl
      backdrop: "static"
      keyboard: false
      windowClass: "signup"
      size: "lg"
    )

  $scope.$watch "status.isLoggedIn", (newValue) ->
    if newValue
      $scope.busy = false
      
      # $state.go("dashboard")
      $state.go("transactions", {accountIndex: "accounts"})
      
  $scope.$watch "uid + password", () ->
    isValid = null
    
    if !$scope.uid? || $scope.uid == ""
      isValid = false
      
    if !$scope.password? || $scope.password == ""
      isValid = false

    if !isValid?
      isValid = true
      
    $scope.isValid = isValid      