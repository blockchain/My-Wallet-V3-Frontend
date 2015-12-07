angular.module('walletApp').directive('languagePicker', ($translate, languages) ->
  {
    restrict: "E"
    replace: 'false'
    scope: {
      language: '='
    }
    templateUrl: 'templates/language-picker.jade'
    link: (scope, elem, attrs) ->
      scope.languages = languages
      scope.didSelect = (item, model) -> scope.language = item
  }
)
