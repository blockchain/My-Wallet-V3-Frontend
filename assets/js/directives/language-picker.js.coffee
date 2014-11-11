walletApp.directive('languagePicker', ($translate, Wallet) ->
  {
    restrict: "E"
    replace: 'false'
    scope: {
      language: '='
    }
    templateUrl: 'templates/language-picker'
    link: (scope, elem, attrs) ->
      scope.languages = Wallet.languages
      
      scope.didSelect = (item, model) ->
        scope.language = item
  }
)