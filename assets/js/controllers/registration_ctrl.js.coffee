@RegistrationCtrl = ($scope, $rootScope, $log, Wallet, $cookieStore, $modal, $state, $timeout) ->
  $scope.status = Wallet.status    
    
  $scope.dismissAgreement = () ->
    Wallet.status.shouldShowAgreement = false

  if $rootScope.beta && !($rootScope.beta.email && $rootScope.beta.key) 
    $state.go("login")
    return
      
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
      