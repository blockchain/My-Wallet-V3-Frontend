angular
  .module('walletDirectives')
  .directive('downloadButton', downloadButton);

function downloadButton ($window, $timeout) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      filename: '@',
      content: '='
    },
    template: '<a href="{{dataRef}}" download="{{filename}}" target="_blank">{{::"DOWNLOAD"|translate}}</a>',
    link: link
  };
  return directive;

  function link (scope, attr, elem) {
    scope.$watch('content', (content) => {
      let blob = new $window.Blob([content], {type: 'text/csv'});
      scope.dataRef = $window.URL.createObjectURL(blob);
    });
    scope.$on('download', (event) => {
      if (!scope.dataRef) return;
      $timeout(() => elem.$$element[0].click());
    });
  }
}
