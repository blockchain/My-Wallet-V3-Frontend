@AppCtrl = ($scope, Wallet, $state, $rootScope,$cookieStore, $timeout, $modal) ->
  $scope.status    = Wallet.status
  $scope.settings = Wallet.settings
  $rootScope.isMock = Wallet.isMock
  $scope.goal = Wallet.goal
  
  #################################
  #           Private             #
  #################################
        
  $scope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) ->    
    if toState.name != "login" && toState.name != "open"
      $scope.checkLogin()
  )
  
  $scope.checkLogin = () ->
    if $scope.status.isLoggedIn == false
      if $scope.savePassword && !!$cookieStore.get("password")  
        observer = {
          needs2FA: () ->
            console.log("Needs 2FA, go to login")
            $state.go("login")
        }
        Wallet.login($cookieStore.get("uid"), $cookieStore.get("password"), null, observer)
      else 
        $state.go("login")
  
  if $state.current.name == ""
    $state.go("transactions", {accountIndex: "accounts"})
    # Tricky because the default account isn't known yet at this point:
    # $state.go("transactions", {accountIndex: Wallet.getDefaultAccountIndex()})
    
        
  $scope.$watch "status.isLoggedIn", () ->
    $scope.checkGoals()
    
  $scope.$watchCollection "goal", () ->
    $scope.checkGoals()

  $scope.checkGoals = () ->
    if $scope.status.isLoggedIn
      if Wallet.goal? 
        if Wallet.goal.send?
          $modal.open(
            templateUrl: "partials/send.jade"
            controller: SendCtrl
            resolve:
              paymentRequest: -> 
                Wallet.goal.send
          )
          
          Wallet.goal.send = undefined
          
        if Wallet.goal.claim?
          $modal.open(
            templateUrl: "partials/claim.jade"
            controller: ClaimModalCtrl
            resolve:
              claim: -> 
                Wallet.goal.claim
          )
        
          Wallet.goal.claim = undefined
      
  $scope.$on "requireSecondPassword", (notification, continueCallback, insist) ->
    modalInstance = $modal.open(
      templateUrl: "partials/second-password.jade"
      controller: SecondPasswordCtrl
      backdrop: if insist then "static" else null # Undismissable if "insist"
      resolve:
        insist: ->
          insist
    )
    
    modalInstance.result.then((secondPassword) ->
      correctPassword = () ->
        
      wrongPassword = () ->
        Wallet.displayError("Second password incorrect")
        
        
      continueCallback(secondPassword, correctPassword, wrongPassword)
    )
  
  $scope.$on "needsUpgradeToHD", (notification, continueCallback) ->
    modalInstance = $modal.open(
      templateUrl: "partials/upgrade.jade"
      controller: UpgradeCtrl,
      backdrop: "static" # Undismissable
    )
        
    modalInstance.result.then(() ->
      continueCallback()
    )