walletApp.controller "FeedbackCtrl", ($scope, $log, $state, $http) ->
 
  $scope.state = $state

  # 0 = not submitted
  # 1 = submitted
  # 2 = success
  # 3 = failure
  $scope.formStage = 0

  $scope.setFormSubmitted = () ->
    if $scope.formStage == 0
      form =
        'rating': $scope.rating
        'description-good': $scope.descriptionGood
        'description-bad': $scope.descriptionBad
        'fullname': $scope.fullname
        'email': $scope.email

      $http.post('/feedback', form).
        success((data) ->
          if data.success
            $scope.formStage = 2
          else
            $scope.formStage = 3
        ).
        error(() ->
          $scope.formStage = 3
        )
    $scope.formStage = 1