@RegistrationCtrl = ($scope, $log, Wallet, $cookieStore, $modal, $state, $timeout) ->
  $scope.status = Wallet.status    
      
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
      
      $state.go("register.finish.show")
      