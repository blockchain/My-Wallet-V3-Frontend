angular
  .module('walletApp')
  .directive('downloadButton', downloadButton);

function downloadButton ($window, $timeout) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      filename: '@',
      content: '='
    },
    template: '<a href="{{dataRef}}" download="{{filename}}" target="_blank" rel="noopener noreferrer">{{::"DOWNLOAD"|translate}}</a>',
    link: link
  };
  return directive;

  function link (scope, attr, elem) {
    scope.createDataUri = (data) => (
      `data:text/plain;charset=utf-8,${encodeURIComponent(data)}`
    );

    scope.$watch('content', (content) => {
      scope.dataRef = scope.createDataUri(content);
    });

    scope.$on('download', (event) => {
      if (!scope.dataRef) return;
      $timeout(() => elem.$$element[0].click());
    });
  }
}
