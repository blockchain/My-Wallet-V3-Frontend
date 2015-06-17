walletApp.directive('bcAsyncInput', (Wallet) ->
  {
    restrict: "E"
    replace: 'true'
    require: 'ngModel'
    scope: {
      ngModel: '='
      validator: '='
      onSave: '='
      onChange: '='
      actionTitle: '='
      placeholder: '='
      type: '@'
      errorMessage: '='
    }
    templateUrl: 'templates/bc-async-input.jade'
  }
)
