
angular
  .module('walletApp')
  .directive('languagePicker', languagePicker);

function languagePicker($translate, languages) {
  const directive = {
    restrict: 'E',
    replace: false,
    scope: {
      language: '='
    },
    templateUrl: 'templates/language-picker.jade',
    link: link
  };
  return directive;

  function link(scope, elem, attrs) {
    scope.languages = languages;
    scope.didSelect = (item, model) => {
      scope.language = item;
    };
  }
}
